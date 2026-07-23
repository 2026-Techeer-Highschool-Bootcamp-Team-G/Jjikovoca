package com.jjikboka.core.card;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

/**
 * user_quota_daily 복합 PK (user_id + quota_date). 날짜별 행 분리로 자정 리셋 로직이 사라진다(03).
 */
class UserQuotaDailyId implements Serializable {

    private Long userId;
    private LocalDate quotaDate;

    protected UserQuotaDailyId() {
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UserQuotaDailyId that)) {
            return false;
        }
        return Objects.equals(userId, that.userId) && Objects.equals(quotaDate, that.quotaDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, quotaDate);
    }
}
