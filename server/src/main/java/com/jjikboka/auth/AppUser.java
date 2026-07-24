package com.jjikboka.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * 사용자 (03 app_user). 인증·프로필 전용 — premium/voice_locale 없음(리팩터링 v1.9).
 * ArchUnit 규칙: @Entity는 패키지 밖 비공개 → 노출은 DTO로만(04 §11-7).
 */
@Entity
@Table(name = "app_user")
class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(length = 50)
    private String nickname;

    // created_at/updated_at은 DB DEFAULT·ON UPDATE가 관리 (INSERT/UPDATE 문에서 제외)
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    protected AppUser() {
    }

    private AppUser(String email, String passwordHash, String nickname) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.nickname = nickname;
    }

    static AppUser create(String email, String passwordHash, String nickname) {
        return new AppUser(email, passwordHash, nickname);
    }

    /**
     * 계정 탈퇴 (DELETE /api/account) — soft delete. deleted_at을 찍고 이메일을 툼스톤으로 치환한다.
     * 원 이메일을 비워 재가입을 허용하고(unique 충돌 방지), 원 이메일로는 더 이상 로그인·조회되지 않게 한다.
     */
    void softDelete(LocalDateTime now) {
        this.deletedAt = now;
        this.email = "deleted_" + id + "@deleted.jjikboka";
    }

    Long getId() {
        return id;
    }

    String getEmail() {
        return email;
    }

    String getPasswordHash() {
        return passwordHash;
    }

    String getNickname() {
        return nickname;
    }
}
