package com.jjikboka.core.card;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * subscription 저장소. package-private 봉인(13 §2).
 * 만료가 가장 늦은(=가장 유효한) 구독 한 건으로 premium을 판정한다.
 */
interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    Optional<Subscription> findFirstByUserIdOrderByExpiresAtDesc(Long userId);
}
