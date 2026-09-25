package com.jjikboka.notification.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * 알림 (03 notification, Phase 4). streak·레벨업 등 발생형 알림을 저장한다 —
 * 복습 대기는 조회 시 파생이라 저장하지 않는다. @Entity는 모듈 밖 비공개(ArchUnit) — 노출은 DTO로만.
 */
@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String message;

    @Column(name = "is_read", nullable = false)
    private boolean read;

    // created_at은 DB DEFAULT가 관리 (INSERT 문에서 제외)
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    protected Notification() {
    }

    private Notification(Long userId, String type, String message) {
        this.userId = userId;
        this.type = type;
        this.message = message;
        this.read = false;
    }

    public static Notification of(Long userId, String type, String message) {
        return new Notification(userId, type, message);
    }

    public void markRead() {
        this.read = true;
    }

    public Long getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public String getMessage() {
        return message;
    }

    public boolean isRead() {
        return read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
