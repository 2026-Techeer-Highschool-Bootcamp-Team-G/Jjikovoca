package com.jjikboka.core.review;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * study_log 저장소. package-private 봉인(13 §2). INSERT-only 원장이라 저장만 쓴다 —
 * 집계 조회는 core.stats(리포트)가 별도로 담당한다.
 */
interface StudyLogRepository extends JpaRepository<StudyLog, Long> {
}
