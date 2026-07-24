package com.jjikboka.core.stats;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

/**
 * 랭킹 값 조회 (core.stats 공개 진입점, API-20). weekly는 exp_log 주간 획득 합, level은 user_stat 누적 레벨 순위다.
 * userId·value만 돌려주고, 닉네임은 app이 auth에서 붙인다(슬라이스 경계, 13 §2).
 */
@Service
public class RankingService {

    private final ExpLogRepository expLogRepository;
    private final UserStatRepository userStatRepository;

    RankingService(ExpLogRepository expLogRepository, UserStatRepository userStatRepository) {
        this.expLogRepository = expLogRepository;
        this.userStatRepository = userStatRepository;
    }

    /** scope가 "level"이면 누적 레벨 순, 그 외(weekly 기본)는 이번 주 획득 순. limit만큼 상위. */
    @Transactional(readOnly = true)
    public List<RankEntry> getRanking(String scope, int limit) {
        PageRequest page = PageRequest.of(0, limit);
        List<Object[]> rows = "level".equals(scope)
                ? userStatRepository.levelRanking(page)
                : expLogRepository.weeklyRanking(weekStart(), page);
        return rows.stream()
                .map(row -> new RankEntry(((Number) row[0]).longValue(), ((Number) row[1]).longValue()))
                .toList();
    }

    /** 이번 주 시작(월요일). 주간 랭킹의 집계 기준. */
    private LocalDate weekStart() {
        return LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }
}
