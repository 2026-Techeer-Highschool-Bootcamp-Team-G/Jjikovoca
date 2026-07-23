package com.jjikboka.core.stats;

import com.jjikboka.core.card.CardStatsService;
import com.jjikboka.core.card.PremiumQueryService;
import com.jjikboka.core.review.StudyStats;
import com.jjikboka.core.review.StudyStatsService;
import com.jjikboka.shared.error.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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

    ReportService(StudyStatsService studyStatsService,
                  CardStatsService cardStatsService,
                  PremiumQueryService premiumQueryService) {
        this.studyStatsService = studyStatsService;
        this.cardStatsService = cardStatsService;
        this.premiumQueryService = premiumQueryService;
    }

    @Transactional(readOnly = true)
    public ReportView getMonthlyReport(Long userId, String period) {
        YearMonth target = parsePeriod(period);
        LocalDateTime start = target.atDay(1).atStartOfDay();
        LocalDateTime end = target.plusMonths(1).atDay(1).atStartOfDay();

        StudyStats stats = studyStatsService.getStudyStats(userId, start, end);
        ReportBasic basic = new ReportBasic(
                cardStatsService.newCards(userId, start, end),
                stats.studyCount(),
                new Accuracy(stats.accuracyWord(), stats.accuracyProblem()));

        List<GrassDay> grass = stats.grass().stream()
                .map(point -> new GrassDay(point.date(), point.count()))
                .toList();

        ReportFull full = premiumQueryService.isPremium(userId) ? buildFull(userId, start, end, stats) : null;
        return new ReportView(target.format(MONTH), basic, full, grass);
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
