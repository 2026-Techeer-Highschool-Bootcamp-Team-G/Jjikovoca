package com.jjikboka.app.me;

import com.jjikboka.auth.UserProfile;
import com.jjikboka.auth.UserQueryService;
import com.jjikboka.core.card.PremiumQueryService;
import com.jjikboka.core.card.QuotaQueryService;
import com.jjikboka.core.card.QuotaStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * 내 정보 조합 (app 조립 레벨). auth·core.card의 공개 조회 서비스만 호출해 조립한다 —
 * 도메인끼리는 서로를 모르고(13 §2), app이 조립만 담당한다.
 */
@Service
class MeService {

    private final UserQueryService userQueryService;
    private final PremiumQueryService premiumQueryService;
    private final QuotaQueryService quotaQueryService;
    private final boolean aiMockMode;

    MeService(UserQueryService userQueryService,
              PremiumQueryService premiumQueryService,
              QuotaQueryService quotaQueryService,
              @Value("${gemini.mock:false}") boolean aiMockMode) {
        this.userQueryService = userQueryService;
        this.premiumQueryService = premiumQueryService;
        this.quotaQueryService = quotaQueryService;
        this.aiMockMode = aiMockMode;
    }

    MeResponse getMe(Long userId) {
        UserProfile profile = userQueryService.getProfile(userId);
        boolean premium = premiumQueryService.isPremium(userId);
        QuotaStatus quota = quotaQueryService.getToday(userId);
        return new MeResponse(
                profile.email(), profile.nickname(), premium,
                quota.used(), quota.limit(), aiMockMode);
    }
}
