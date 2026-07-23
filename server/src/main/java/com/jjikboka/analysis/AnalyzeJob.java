package com.jjikboka.analysis;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * 분석 작업 상태 머신 (03 analyze_job, 13 §6). 접수 시 PENDING으로 생성되고,
 * Phase 2 워커가 RUNNING→DONE/FAILED로 전이한다. user_id는 크로스 경계라 FK 없이 값+인덱스(13 §4).
 * @Entity는 analysis 밖에서 비공개 — 노출은 조회 서비스의 DTO/식별자로만(13 §2).
 */
@Entity
@Table(name = "analyze_job")
class AnalyzeJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    protected AnalyzeJob() {
    }

    /** 접수 시점의 job — 상태는 PENDING. 실제 분석은 Phase 2 워커가 이어받는다. */
    static AnalyzeJob pending(Long userId) {
        AnalyzeJob job = new AnalyzeJob();
        job.userId = userId;
        job.status = "PENDING";
        return job;
    }

    Long getId() {
        return id;
    }

    String getStatus() {
        return status;
    }
}
