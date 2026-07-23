package com.jjikboka.core.card;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

/**
 * user_quota_daily 저장소. package-private 봉인(13 §2).
 */
interface UserQuotaDailyRepository extends JpaRepository<UserQuotaDaily, UserQuotaDailyId> {

    Optional<UserQuotaDaily> findByUserIdAndQuotaDate(Long userId, LocalDate quotaDate);
}
