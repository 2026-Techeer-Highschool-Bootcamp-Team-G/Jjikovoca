package com.jjikboka.subscription;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 프리미엄 구독 (core.card 공개 진입점). 조회(isPremium·premiumDetail)와 명령(activate·cancel)을 한 서비스로 묶는다 —
 * subscription의 미만료로 premium을 판정하고(해지해도 결제 기간까지 유지, 명세 §8), 모의 결제로 활성화한다.
 * subscription 엔티티는 패키지 비공개 — app 레이어는 이 서비스의 boolean·DTO만 쓴다(13 §2).
 */
@Service
public class PremiumService {

    private final SubscriptionRepository subscriptionRepository;

    PremiumService(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    /** 프리미엄 여부 — 유효(미만료) 구독 존재로 판정. app 조립(/api/me)·quota 한도 계산 등이 쓴다. */
    public boolean isPremium(Long userId) {
        return subscriptionRepository.findFirstByUserIdOrderByExpiresAtDesc(userId)
                .filter(subscription -> subscription.grantsPremiumAt(LocalDateTime.now()))
                .isPresent();
    }

    /** 프리미엄 결제 정보(API-3 me) — 유효 구독의 plan·만료일. 없음/만료면 premium=false·null. */
    public PremiumDetail premiumDetail(Long userId) {
        return subscriptionRepository.findFirstByUserIdOrderByExpiresAtDesc(userId)
                .filter(subscription -> subscription.grantsPremiumAt(LocalDateTime.now()))
                .map(subscription -> new PremiumDetail(true, subscription.getPlan(), subscription.getExpiresAt()))
                .orElseGet(() -> new PremiumDetail(false, null, null));
    }

    /**
     * 모의 결제로 프리미엄을 활성화한다(API-5). 이미 활성(미만료) 구독이 있으면 새로 만들지 않고 그대로 true —
     * 항상 활성 상태를 보장하므로 반환은 언제나 true(멱등).
     */
    @Transactional
    public boolean activate(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        boolean alreadyActive = subscriptionRepository.findFirstByUserIdOrderByExpiresAtDesc(userId)
                .filter(subscription -> subscription.grantsPremiumAt(now))
                .isPresent();
        if (!alreadyActive) {
            subscriptionRepository.save(Subscription.mockActivated(userId, now));
        }
        return true;
    }

    /**
     * 프리미엄 해지(DELETE /api/premium) — 유효 구독을 CANCELLED로 표시한다(더티 체킹). 결제한 기간(만료)까지는
     * premium 유지(명세 §8)이므로 유효 구독이 있으면 해지 후에도 true. 유효 구독이 없으면 아무것도 않고 false(멱등).
     */
    @Transactional
    public boolean cancel(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        Optional<Subscription> active = subscriptionRepository.findFirstByUserIdOrderByExpiresAtDesc(userId)
                .filter(subscription -> subscription.grantsPremiumAt(now));
        active.ifPresent(Subscription::cancel);
        return active.isPresent();
    }
}
