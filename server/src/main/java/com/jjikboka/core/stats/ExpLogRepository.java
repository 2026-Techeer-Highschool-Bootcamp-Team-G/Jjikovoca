package com.jjikboka.core.stats;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

/**
 * exp_log 저장소. package-private 봉인(13 §2). INSERT-only 원장이라 저장과 일일 한도 집계만 쓴다.
 */
interface ExpLogRepository extends JpaRepository<ExpLog, Long> {

    /** 특정 날짜에 이 사용자가 획득한 경험치 합(일일 한도·todayEarned). 없으면 0. */
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM ExpLog e WHERE e.userId = :userId AND e.earnDate = :date")
    int sumEarnedOn(@Param("userId") Long userId, @Param("date") LocalDate date);
}
