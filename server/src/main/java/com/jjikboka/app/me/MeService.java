package com.jjikboka.app.me;

import com.jjikboka.auth.UserProfile;
import com.jjikboka.auth.UserQueryService;
import com.jjikboka.core.card.PremiumDetail;
import com.jjikboka.core.card.PremiumQueryService;
import com.jjikboka.core.card.QuotaQueryService;
import com.jjikboka.core.card.QuotaStatus;
import com.jjikboka.core.stats.ExpService;
import com.jjikboka.core.stats.ExpSummary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * 내 정보 조합 (app 조립 레벨). auth·core.card·core.stats의 공개 조회 서비스만 호출해 조립한다 —
 * 도메인끼리는 서로를 모르고(13 §2), app이 조립만 담당한다. level/exp는 exp 현황에서, 결제정보는 프리미엄 조회에서 가져온다.
 */
@Service
class MeService {

    /** 모의 결제 금액(원) — 실 PG 전환 시 plan별 가격표로 대체(현재 단일 상수). */
    private static final int PREMIUM_AMOUNT = 4900;

    private final UserQueryService userQueryService;
    private final PremiumQueryService premiumQueryService;
    private final QuotaQueryService quotaQueryService;
    private final ExpService expService;
    private final boolean aiMockMode;

    MeService(UserQueryService userQueryService,
              PremiumQueryService premiumQueryService,
              QuotaQueryService quotaQueryService,
              ExpService expService,
              @Value("${gemini.mock:false}") boolean aiMockMode) {
        this.userQueryService = userQueryService;
        this.premiumQueryService = premiumQueryService;
        this.quotaQueryService = quotaQueryService;
        this.expService = expService;
        this.aiMockMode = aiMockMode;
    }

    MeResponse getMe(Long userId) {
        UserProfile profile = userQueryService.getProfile(userId);
        PremiumDetail premium = premiumQueryService.premiumDetail(userId);
        QuotaStatus quota = quotaQueryService.getToday(userId);
        ExpSummary exp = expService.getSummary(userId);
        Integer amount = premium.premium() ? PREMIUM_AMOUNT : null;
        return new MeResponse(
                profile.email(), profile.nickname(), premium.premium(),
                quota.used(), quota.limit(), aiMockMode,
                exp.level(), exp.exp(),
                premium.plan(), premium.expiresAt(), amount);
    }
}
