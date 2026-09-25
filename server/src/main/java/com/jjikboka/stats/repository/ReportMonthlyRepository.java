package com.jjikboka.stats.repository;

import com.jjikboka.stats.entity.ReportMonthly;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * report_monthly 저장소. package-private 봉인(13 §2). 스냅샷은 user_id+period가 UNIQUE라 upsert 전 존재를 확인한다.
 */
public interface ReportMonthlyRepository extends JpaRepository<ReportMonthly, Long> {

    Optional<ReportMonthly> findByUserIdAndPeriod(Long userId, String period);
}
