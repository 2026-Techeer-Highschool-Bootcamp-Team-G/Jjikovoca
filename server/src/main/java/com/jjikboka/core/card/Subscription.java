package com.jjikboka.core.card;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * 구독 (03 subscription). 결제 모의 단계라 provider='MOCK'. premium 여부는 이 행의
 * status='ACTIVE' && expires_at > now 로 계산한다(app_user에 premium 컬럼 없음).
 * @Entity는 패키지 비공개 — 노출은 조회 서비스의 boolean/DTO로만(13 §2).
 */
@Entity
@Table(name = "subscription")
class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String plan;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String provider;

    @Column(name = "billing_key")
    private String billingKey;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    protected Subscription() {
    }

    String getStatus() {
        return status;
    }

    LocalDateTime getExpiresAt() {
        return expiresAt;
    }
}
