package com.jjikboka.core.card;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 일별 AI 사용 한도 (03 user_quota_daily, NFR-02). 복합 PK(user_id, quota_date).
 * me 조회는 오늘 used_count만 읽는다. 차감(원자적 조건부 UPDATE)은 analyze에서 별도로 한다.
 */
@Entity
@Table(name = "user_quota_daily")
@IdClass(UserQuotaDailyId.class)
class UserQuotaDaily {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Id
    @Column(name = "quota_date")
    private LocalDate quotaDate;

    @Column(name = "used_count", nullable = false)
    private int usedCount;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    protected UserQuotaDaily() {
    }

    int getUsedCount() {
        return usedCount;
    }
}
