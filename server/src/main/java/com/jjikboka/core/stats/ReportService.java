package com.jjikboka.core.stats;

import com.jjikboka.core.card.CardStatsService;
import com.jjikboka.core.card.PremiumQueryService;
import com.jjikboka.core.review.StudyStats;
import com.jjikboka.core.review.StudyStatsService;
import com.jjikboka.core.review.SubjectMinutes;
import com.jjikboka.shared.error.BusinessException;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
import java.util.List;

/**
 * 월간 리포트 조합 (core.stats 공개 진입점, API-17). study_log 집계(core.review)와 card 집계(core.card)를 모아
 * 리포트로 만든다(같은 core 슬라이스). <b>full은 프리미엄 전용</b> — 무료 사용자는 null로 내려간다(F-10).
 * period 형식이 어긋나면 400 INVALID_PERIOD.
 */
@Service
public class ReportService {

    private static final DateTimeFormatter MONTH = DateTimeFormatter.ofPattern("yyyy-MM");

    private final StudyStatsService studyStatsService;
    private final CardStatsService cardStatsService;
    private final PremiumQueryService premiumQueryService;
    private final ReportSnapshotService reportSnapshotService;

    ReportService(StudyStatsService studyStatsService,
                  CardStatsService cardStatsService,
                  PremiumQueryService premiumQueryService,
                  ReportSnapshotService reportSnapshotService) {
        this.studyStatsService = studyStatsService;
        this.cardStatsService = cardStatsService;
        this.premiumQueryService = premiumQueryService;
        this.reportSnapshotService = reportSnapshotService;
    }

    /**
     * 월간 리포트(캐시-어사이드, 13 §9). 핫패스인 현재월(period 미지정)만 유저별로 캐싱한다 — 과거월(period 지정)은
     * 조회가 드물고 캐시 정합 관리 비용이 커서 우회한다(condition). 무효화는 학습 기록 이벤트로(evict, {@code ReportCacheEvictor}).
     */
    @Cacheable(cacheNames = "report:monthly", key = "#userId", condition = "#period == null")
    @Transactional(readOnly = true)
    public ReportView getMonthlyReport(Long userId, String period) {
        YearMonth target = parsePeriod(period);
        LocalDateTime start = target.atDay(1).atStartOfDay();
        LocalDateTime end = target.plusMonths(1).atDay(1).atStartOfDay();

        StudyStats stats = studyStatsService.getStudyStats(userId, start, end);
        ReportBasic basic = new ReportBasic(
                cardStatsService.newCards(userId, start, end),
                stats.studyCount(),
                new Accuracy(stats.accuracyWord(), stats.accuracyProblem()),
                subjectBreakdown(userId, start, end));

        List<GrassDay> grass = stats.grass().stream()
                .map(point -> new GrassDay(point.date(), point.count()))
                .toList();

        ReportFull full = premiumQueryService.isPremium(userId) ? buildFull(userId, start, end, stats) : null;

        // 완료된 과거 월이면 스냅샷을 durable하게 남긴다(멱등 upsert, 별도 트랜잭션). 현재/미래 월은 아직 진행 중이라 제외.
        if (target.isBefore(YearMonth.now())) {
            long graduated = cardStatsService.graduated(userId, start, end);
            reportSnapshotService.snapshot(userId, target.format(MONTH), basic, stats, graduated);
        }

        return new ReportView(target.format(MONTH), basic, full, grass);
    }

    /** 과목 도넛(API-17) — core.review 원장 집계에 전체 분 대비 비율(0~1, 소수 2자리)을 붙여 완성한다. 전체 0분이면 ratio 0. */
    private List<SubjectStat> subjectBreakdown(Long userId, LocalDateTime start, LocalDateTime end) {
        List<SubjectMinutes> minutes = studyStatsService.subjectBreakdown(userId, start, end);
        int total = minutes.stream().mapToInt(SubjectMinutes::minutes).sum();
        return minutes.stream()
                .map(m -> new SubjectStat(m.subject(), m.minutes(), m.count(),
                        total == 0 ? 0.0
                                : BigDecimal.valueOf((double) m.minutes() / total)
                                        .setScale(2, RoundingMode.HALF_UP).doubleValue()))
                .sorted(Comparator.comparingInt(SubjectStat::minutes).reversed())   // 학습 시간 내림차순(명세 §6)
                .toList();
    }

    private ReportFull buildFull(Long userId, LocalDateTime start, LocalDateTime end, StudyStats stats) {
        long graduated = cardStatsService.graduated(userId, start, end);
        Growth growth = new Growth(null, "이번 달 " + graduated + "개를 외웠어요");
        return new ReportFull(stats.reasonBreakdown(), cardStatsService.weakConcepts(userId), growth, graduated);
    }

    private YearMonth parsePeriod(String period) {
        if (period == null || period.isBlank()) {
            return YearMonth.now();
        }
        try {
            return YearMonth.parse(period, MONTH);
        } catch (DateTimeParseException e) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_PERIOD",
                    "기간 형식이 올바르지 않습니다. (YYYY-MM)");
        }
    }
}
