package com.jjikboka.core.card;

import org.springframework.stereotype.Service;

import java.time.LocalDate;

/**
 * 오늘의 사용량 조회 (core.card 공개 진입점). 한도는 프리미엄 여부로 결정된다(free 5 · premium 100).
 * app 조립 레벨(/api/me)이 이 값을 프로필과 조합한다. 차감은 여기서 하지 않는다.
 */
@Service
public class QuotaQueryService {

    private static final int FREE_LIMIT = 5;
    private static final int PREMIUM_LIMIT = 100;

    private final UserQuotaDailyRepository quotaRepository;
    private final PremiumQueryService premiumQueryService;

    QuotaQueryService(UserQuotaDailyRepository quotaRepository, PremiumQueryService premiumQueryService) {
        this.quotaRepository = quotaRepository;
        this.premiumQueryService = premiumQueryService;
    }

    public QuotaStatus getToday(Long userId) {
        int used = quotaRepository.findByUserIdAndQuotaDate(userId, LocalDate.now())
                .map(UserQuotaDaily::getUsedCount)
                .orElse(0);
        int limit = premiumQueryService.isPremium(userId) ? PREMIUM_LIMIT : FREE_LIMIT;
        return new QuotaStatus(used, limit);
    }
}
