package com.jjikboka.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * refresh 토큰 (03 refresh_token). 무상태 JWT의 refresh만 저장(13 §5).
 * 평문이 아니라 해시(token_hash)로 저장하며, 재발급 시 조회·폐기·재사용 탐지에 쓴다.
 * user_id는 값으로만 보관(도메인 내부 FK) — @ManyToOne 대신 단순 참조.
 */
@Entity
@Table(name = "refresh_token")
class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    protected RefreshToken() {
    }

    private RefreshToken(Long userId, String tokenHash, LocalDateTime expiresAt) {
        this.userId = userId;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
    }

    static RefreshToken issue(Long userId, String tokenHash, LocalDateTime expiresAt) {
        return new RefreshToken(userId, tokenHash, expiresAt);
    }

    Long getUserId() {
        return userId;
    }

    LocalDateTime getExpiresAt() {
        return expiresAt;
    }
}
