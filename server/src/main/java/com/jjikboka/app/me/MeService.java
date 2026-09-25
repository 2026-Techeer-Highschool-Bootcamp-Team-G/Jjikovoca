package com.jjikboka.app.me;

import com.jjikboka.auth.dto.UserProfile;
import com.jjikboka.auth.service.UserQueryService;
import com.jjikboka.subscription.dto.PremiumDetail;
import com.jjikboka.subscription.service.PremiumService;
import com.jjikboka.quota.service.QuotaService;
import com.jjikboka.quota.dto.QuotaStatus;
import com.jjikboka.stats.service.ExpService;
import com.jjikboka.stats.dto.ExpSummary;
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
    private final PremiumService premiumService;
    private final QuotaService quotaService;
    private final ExpService expService;
    private final boolean aiMockMode;

    MeService(UserQueryService userQueryService,
              PremiumService premiumService,
              QuotaService quotaService,
              ExpService expService,
              @Value("${gemini.mock:false}") boolean aiMockMode) {
        this.userQueryService = userQueryService;
        this.premiumService = premiumService;
        this.quotaService = quotaService;
        this.expService = expService;
        this.aiMockMode = aiMockMode;
    }

    MeResponse getMe(Long userId) {
        UserProfile profile = userQueryService.getProfile(userId);
        PremiumDetail premium = premiumService.premiumDetail(userId);
        QuotaStatus quota = quotaService.getToday(userId);
        ExpSummary exp = expService.getSummary(userId);
        Integer amount = premium.premium() ? PREMIUM_AMOUNT : null;
        return new MeResponse(
                profile.email(), profile.nickname(), premium.premium(),
                quota.used(), quota.limit(), aiMockMode,
                exp.level(), exp.exp(),
                premium.plan(), premium.expiresAt(), amount);
    }
}
