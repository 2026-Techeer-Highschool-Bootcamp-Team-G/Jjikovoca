package com.jjikboka.core.card;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * 프리미엄 여부 조회 (core.card 공개 진입점). subscription의 status='ACTIVE' && 미만료로 판정한다.
 * app 조립 레벨(/api/me)·quota 한도 계산 등이 이 boolean을 쓴다.
 */
@Service
public class PremiumQueryService {

    private final SubscriptionRepository subscriptionRepository;

    PremiumQueryService(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    public boolean isPremium(Long userId) {
        return subscriptionRepository.findFirstByUserIdOrderByExpiresAtDesc(userId)
                .filter(subscription -> "ACTIVE".equals(subscription.getStatus())
                        && subscription.getExpiresAt().isAfter(LocalDateTime.now()))
                .isPresent();
    }
}
