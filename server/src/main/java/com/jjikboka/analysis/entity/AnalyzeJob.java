package com.jjikboka.analysis.entity;

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
 *
 * <p><b>내구 처리(P1-6)</b>: 재구성 payload(type·cropImageRefs·words·fullImageRef)를 JSON으로 영속화해
 * 이벤트 유실·크래시 후에도 job만으로 재처리할 수 있다. lease_until·attempts·last_error는
 * lease 기반 claim(조건부 원자 UPDATE)과 재시도 상한을 위한 상태다 — claim 전이는 서비스가
 * 네이티브 UPDATE로 수행하므로 이 엔티티는 payload·상태를 담고 접근자만 노출한다.
 */
@Entity
@Table(name = "analyze_job")
public class AnalyzeJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String status;

    @Column(name = "payload_json", columnDefinition = "json")   // 재구성 payload 원문(직렬화는 서비스가 한다). Card.solutions와 같은 매핑 관례.
    private String payloadJson;

    @Column(name = "lease_until")
    private LocalDateTime leaseUntil;

    @Column(nullable = false)
    private int attempts;

    @Column(name = "last_error")
    private String lastError;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    protected AnalyzeJob() {
    }

    /**
     * 접수 시점의 job — 상태는 PENDING, 재구성 payload를 함께 싣는다(이벤트 유실 대비).
     * 실제 분석은 Phase 2 워커·watchdog가 claim해 이어받는다.
     */
    public static AnalyzeJob pending(Long userId, String payloadJson) {
        AnalyzeJob job = new AnalyzeJob();
        job.userId = userId;
        job.status = "PENDING";
        job.payloadJson = payloadJson;
        return job;
    }

    /** 워커가 처리를 시작할 때. PENDING→RUNNING. */
    public void markRunning() {
        this.status = "RUNNING";
    }

    /** 카드 생성까지 끝났을 때. →DONE(폴링 응답에선 COMPLETED로 매핑). */
    public void markDone() {
        this.status = "DONE";
    }

    /** 폴백 소진 등 최종 실패. →FAILED. quota 환불은 app 워커가 별도로 수행한다(13 §6). */
    public void markFailed() {
        this.status = "FAILED";
    }

    /** 마지막 실패 사유를 남긴다(관측·디버깅) — 상태 전이와 무관하게 last_error만 갱신한다. */
    public void recordError(String error) {
        this.lastError = error;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getStatus() {
        return status;
    }

    public String getPayloadJson() {
        return payloadJson;
    }

    public LocalDateTime getLeaseUntil() {
        return leaseUntil;
    }

    public int getAttempts() {
        return attempts;
    }

    public String getLastError() {
        return lastError;
    }
}
