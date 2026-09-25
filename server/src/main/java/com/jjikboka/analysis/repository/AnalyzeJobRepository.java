package com.jjikboka.analysis.repository;

import com.jjikboka.analysis.entity.AnalyzeJob;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * analyze_job 저장소. package-private 봉인(13 §2). 접수 시 PENDING 저장,
 * Phase 2 상태 전이·조회에 더해 P1-6 내구 처리(lease claim·watchdog 재수거)를 담당한다.
 *
 * <p>claim은 QuotaService.tryIncrement와 같은 <b>조건부 원자 UPDATE</b> 패턴이다 —
 * WHERE의 상태·lease 판정과 전이가 한 행 락 안에서 일어나 @Async·watchdog가 동시에 노려도 1개만 성공한다.
 */
public interface AnalyzeJobRepository extends JpaRepository<AnalyzeJob, Long> {

    /**
     * lease 기반 claim (조건부 원자 UPDATE). claimable = PENDING 또는 lease 만료 RUNNING일 때만
     * RUNNING으로 전이하고 lease_until을 DB 시계 기준 NOW(6)+:leaseSeconds초로 잡으며 attempts+1 한다.
     * 영향 행 수를 돌려준다(1=성공, 0=경합 패배). 시간 판정을 앱의 LocalDateTime이 아닌 DB 시계(NOW(6))로 통일해
     * JVM 시간대·다중 인스턴스 시계 드리프트에 영향받지 않는다. WHERE의 상태·lease 비교와 UPDATE가 한 행 락 안에서 일어나
     * 동시 claim에도 정확히 1개만 성공한다.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE analyze_job "
            + "SET status = 'RUNNING', lease_until = DATE_ADD(NOW(6), INTERVAL :leaseSeconds SECOND), attempts = attempts + 1 "
            + "WHERE id = :jobId "
            + "AND (status = 'PENDING' OR (status = 'RUNNING' AND lease_until < NOW(6)))", nativeQuery = true)
    int claim(@Param("jobId") Long jobId, @Param("leaseSeconds") long leaseSeconds);

    /**
     * watchdog 재수거 후보 id — claimable(PENDING, 또는 lease 만료 RUNNING) job의 식별자만 고른다.
     * lease 만료 판정은 claim과 동일하게 DB 시계(NOW(6))로 한다. ix_job_lease(status, lease_until)를 타며,
     * 실제 소유권은 각 후보를 claim해 다시 판정한다(조회≠소유).
     */
    @Query(value = "SELECT id FROM analyze_job "
            + "WHERE status = 'PENDING' "
            + "OR (status = 'RUNNING' AND lease_until < NOW(6)) "
            + "ORDER BY id LIMIT :limit", nativeQuery = true)
    List<Long> findClaimableIds(@Param("limit") int limit);
}
