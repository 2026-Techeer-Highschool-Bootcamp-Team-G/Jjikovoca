package com.jjikboka.core.card;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 프리미엄 활성화 (API-5, core.card 공개 진입점). 모의 결제 단계라 검증 없이 결제 완료 상태만 부여한다.
 * subscription 엔티티는 패키지 비공개 — app 레이어는 이 서비스의 boolean만 쓴다(13 §2).
 */
@Service
public class PremiumActivationService {

    private final SubscriptionRepository subscriptionRepository;

    PremiumActivationService(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    /**
     * 모의 결제로 프리미엄을 활성화한다. 이미 활성(ACTIVE·미만료) 구독이 있으면 새로 만들지 않고
     * 그대로 true를 반환해 <b>멱등</b>하게 동작한다. 항상 활성 상태를 보장하므로 반환은 언제나 true.
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
     * 프리미엄 해지 (DELETE /api/premium) — 유효 구독을 CANCELLED로 표시한다(더티 체킹으로 반영).
     * <b>결제한 기간(만료)까지는 premium 유지</b>(명세 §8)이므로 유효 구독이 있으면 해지 후에도 {@code premium=true}를 반환한다.
     * 유효 구독이 없으면 아무것도 하지 않고 false(멱등).
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
