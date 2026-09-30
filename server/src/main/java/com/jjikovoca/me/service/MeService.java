package com.jjikovoca.me.service;

import com.jjikovoca.auth.dto.UserProfile;
import com.jjikovoca.auth.service.UserQueryService;
import com.jjikovoca.me.dto.MeResponse;
import com.jjikovoca.subscription.dto.PremiumDetail;
import com.jjikovoca.subscription.service.PremiumService;
import com.jjikovoca.quota.service.QuotaService;
import com.jjikovoca.quota.dto.QuotaStatus;
import com.jjikovoca.stats.service.ExpService;
import com.jjikovoca.stats.dto.ExpSummary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * 내 정보 조합 (me 모듈). auth·core.card·core.stats의 공개 조회 서비스만 호출해 조립한다 —
 * 도메인끼리는 서로를 모르고(13 §2), me 모듈이 조립만 담당한다. level/exp는 exp 현황에서, 결제정보는 프리미엄 조회에서 가져온다.
 */
@Service
public class MeService {

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

    public MeResponse getMe(Long userId) {
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
