package com.jjikboka.core.review;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
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
                .map(row -> new StudyStats.GrassPoint(((Date) row[0]).toLocalDate(), ((Number) row[1]).longValue()))
                .toList();
    }
}
