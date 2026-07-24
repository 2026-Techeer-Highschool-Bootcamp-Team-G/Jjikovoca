package com.jjikboka.core.stats;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

/**
 * exp_log 저장소. package-private 봉인(13 §2). INSERT-only 원장이라 저장과 집계(일일 한도·주간 랭킹)만 쓴다.
 */
interface ExpLogRepository extends JpaRepository<ExpLog, Long> {

    /** 특정 날짜에 이 사용자가 획득한 경험치 합(일일 한도·todayEarned). 없으면 0. */
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM ExpLog e WHERE e.userId = :userId AND e.earnDate = :date")
    int sumEarnedOn(@Param("userId") Long userId, @Param("date") LocalDate date);

    /** 주간 랭킹(API-20) — since 이후 획득 경험치 합이 큰 순 [userId, sum]. limit은 Pageable로. */
    @Query("SELECT e.userId, SUM(e.amount) FROM ExpLog e WHERE e.earnDate >= :since "
            + "GROUP BY e.userId ORDER BY SUM(e.amount) DESC")
    List<Object[]> weeklyRanking(@Param("since") LocalDate since, Pageable pageable);
}
