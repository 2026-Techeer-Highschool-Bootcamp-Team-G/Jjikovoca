package com.jjikboka.core.review;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 월간 학습 집계 (core.review 공개 진입점, API-17). study_log 원장을 리포트용으로 집계해 {@link StudyStats}로 넘긴다.
 * 조합·프리미엄 게이팅은 core.stats가 맡는다(같은 슬라이스, 원장은 여기 소유).
 */
@Service
public class StudyStatsService {

    /** 세션 경계 — 학습 로그 간 간격이 이 분(minute)을 넘으면 새 세션(30분 묶음, 명세 §6). */
    private static final long SESSION_GAP_MINUTES = 30;

    private final StudyLogRepository studyLogRepository;

    StudyStatsService(StudyLogRepository studyLogRepository) {
        this.studyLogRepository = studyLogRepository;
    }

    @Transactional(readOnly = true)
    public StudyStats getStudyStats(Long userId, LocalDateTime start, LocalDateTime end) {
        long studyCount = studyLogRepository.countInPeriod(userId, start, end);
        Double accuracyWord = accuracy(studyLogRepository.accuracyByType(userId, "WORD", start, end));
        Double accuracyProblem = accuracy(studyLogRepository.accuracyByType(userId, "PROBLEM", start, end));
        return new StudyStats(studyCount, accuracyWord, accuracyProblem,
                toReasonMap(studyLogRepository.reasonBreakdown(userId, start, end)),
                toGrass(studyLogRepository.grassCounts(userId, start, end)));
    }

    /** 기간 내 학습 수(API-19 퀘스트) — study_log 카운트만 가볍게. 오늘 복습 진행도 계산에 쓴다. */
    @Transactional(readOnly = true)
    public long studyCount(Long userId, LocalDateTime start, LocalDateTime end) {
        return studyLogRepository.countInPeriod(userId, start, end);
    }

    /**
     * 빈칸 퀴즈 콤보(API-15) — <b>현재 세션</b>의 연속 정답 수를 study_log에서 파생한다. 최신 CLOZE 로그부터 거슬러
     * 올라가며 {@code result=KNOW}이고 직전 로그와의 간격이 {@link #SESSION_GAP_MINUTES}분 이내인 동안 센다.
     * 오답(KNOW 아님)이나 세션 단절을 만나면 멈춘다 — DB 콤보 컬럼 없이 세션 스코프를 만족한다(서버 authoritative).
     *
     * <p>기준 시각 {@code now}는 직전 로그가 아직 세션 안인지 판단하는 앵커다. 이 값은 <b>이번 정답을 기록하기 전에</b>
     * 호출해 "직전까지의 연속 정답 수"를 얻는 용도다(호출부가 정답이면 +1). 최근 소량만 훑는다.
     */
    @Transactional(readOnly = true)
    public int consecutiveClozeCorrect(Long userId, LocalDateTime now) {
        List<Object[]> rows = studyLogRepository.recentClozeResults(userId, PageRequest.of(0, 50));
        int combo = 0;
        LocalDateTime anchor = now;
        for (Object[] row : rows) {
            String result = (String) row[0];
            LocalDateTime at = (LocalDateTime) row[1];
            if (Duration.between(at, anchor).toMinutes() > SESSION_GAP_MINUTES) {
                break;   // 세션 단절 — 여기부터는 다른 세션
            }
            if (!"KNOW".equals(result)) {
                break;   // 오답/헷갈림에서 연속 종료
            }
            combo++;
            anchor = at;
        }
        return combo;
    }

    /** 과목별 학습 집계(API-17 도넛) — [subject, duration_ms 합, 학습 수] → 분·개수. 비율은 core.stats가 조합 시 붙인다. */
    @Transactional(readOnly = true)
    public List<SubjectMinutes> subjectBreakdown(Long userId, LocalDateTime start, LocalDateTime end) {
        return studyLogRepository.subjectBreakdown(userId, start, end).stream()
                .map(row -> new SubjectMinutes(
                        (String) row[0],
                        (int) (((Number) row[1]).longValue() / 60000),
                        ((Number) row[2]).longValue()))
                .toList();
    }

    /**
     * 오늘의 학습 리듬(API-17 rhythm) — 기간(오늘) 학습 로그를 시간순으로 훑어 총 학습 분과 세션 수를 낸다.
     * 세션은 로그 간 간격이 {@link #SESSION_GAP_MINUTES}분을 넘으면 분리. avgSessionMinutes=총 학습 분/세션 수(소수 1자리).
     * 오늘 학습이 없으면 (0, 0.0).
     */
    @Transactional(readOnly = true)
    public Rhythm todayRhythm(Long userId, LocalDateTime start, LocalDateTime end) {
        List<Object[]> rows = studyLogRepository.sessionLogs(userId, start, end);
        long totalMs = 0;
        int sessions = 0;
        LocalDateTime prev = null;
        for (Object[] row : rows) {
            LocalDateTime at = (LocalDateTime) row[0];
            totalMs += ((Number) row[1]).longValue();
            if (prev == null || Duration.between(prev, at).toMinutes() > SESSION_GAP_MINUTES) {
                sessions++;
            }
            prev = at;
        }
        int todayStudyMinutes = (int) (totalMs / 60000);
        double avgSessionMinutes = sessions == 0 ? 0.0
                : BigDecimal.valueOf((totalMs / 60000.0) / sessions).setScale(1, RoundingMode.HALF_UP).doubleValue();
        return new Rhythm(todayStudyMinutes, avgSessionMinutes);
    }

    /** [KNOW 수, 전체 수] → 정확도. 집계라 항상 1행이지만 방어적으로 빈 결과면 null. 전체 0 또는 KNOW=null(대상 없음)이면 null. */
    private Double accuracy(List<Object[]> rows) {
        if (rows.isEmpty()) {
            return null;
        }
        Object[] row = rows.get(0);
        Number know = (Number) row[0];
        long total = ((Number) row[1]).longValue();
        if (total == 0 || know == null) {
            return null;
        }
        return Math.round(know.doubleValue() / total * 100.0) / 100.0;   // 소수 2자리
    }

    private Map<String, Long> toReasonMap(List<Object[]> rows) {
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] row : rows) {
            map.put((String) row[0], ((Number) row[1]).longValue());
        }
        return map;
    }

    private List<StudyStats.GrassPoint> toGrass(List<Object[]> rows) {
        return rows.stream()
                .map(row -> new StudyStats.GrassPoint(((Date) row[0]).toLocalDate(), ((Number) row[1]).longValue(),
                        (int) (((Number) row[2]).longValue() / 60000)))
                .toList();
    }
}
