package com.jjikboka.analysis;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * analyze_job 저장소. package-private 봉인(13 §2). 접수 시 PENDING 저장,
 * Phase 2에서 상태 조회·전이 메서드가 여기 추가된다.
 */
interface AnalyzeJobRepository extends JpaRepository<AnalyzeJob, Long> {
}
