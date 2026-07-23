package com.jjikboka.app.premium;

import com.jjikboka.core.card.PremiumActivationService;
import com.jjikboka.shared.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 프리미엄 활성화 API (Notion API-ID 5). 인증 필요 — JwtAuthenticationFilter가 실은 userId를 넣는다.
 * 모의 결제라 요청 바디 없이 호출만으로 활성화된다(멱등). app→core.card 조립(13 §2).
 */
@RestController
@RequestMapping("/api/premium")
class PremiumController {

    private final PremiumActivationService premiumActivationService;

    PremiumController(PremiumActivationService premiumActivationService) {
        this.premiumActivationService = premiumActivationService;
    }

    @PostMapping("/activate")
    ResponseEntity<ApiResponse<PremiumResponse>> activate(@AuthenticationPrincipal Long userId) {
        boolean premium = premiumActivationService.activate(userId);
        return ResponseEntity.ok(ApiResponse.ok(
                new PremiumResponse(premium), "프리미엄이 활성화되었습니다."));
    }
}
