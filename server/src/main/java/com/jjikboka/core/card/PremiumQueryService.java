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

    /**
     * 프리미엄 결제 정보(API-3 me) — 활성 구독의 plan·만료일. 비활성/없음이면 {@code premium=false}·null.
     * 마이/결제완료 화면이 "다음 결제일"을 보여주는 데 쓴다(금액은 모의라 app이 상수로 붙인다).
     */
    public PremiumDetail premiumDetail(Long userId) {
        return subscriptionRepository.findFirstByUserIdOrderByExpiresAtDesc(userId)
                .filter(subscription -> subscription.isActiveAt(LocalDateTime.now()))
                .map(subscription -> new PremiumDetail(true, subscription.getPlan(), subscription.getExpiresAt()))
                .orElseGet(() -> new PremiumDetail(false, null, null));
    }
}
