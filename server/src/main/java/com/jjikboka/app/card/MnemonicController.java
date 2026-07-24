package com.jjikboka.app.card;

import com.jjikboka.shared.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 연상 이미지 API (API-6c). 인증 필요 — JwtAuthenticationFilter가 실은 userId를 쓴다.
 * 온디맨드 생성(있으면 캐시 반환)이라 부수효과(생성·저장)를 POST로 명시한다.
 */
@RestController
class MnemonicController {

    private final MnemonicService mnemonicService;

    MnemonicController(MnemonicService mnemonicService) {
        this.mnemonicService = mnemonicService;
    }

    @PostMapping("/api/cards/{id}/mnemonic")
    ResponseEntity<ApiResponse<MnemonicResponse>> generate(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        String path = mnemonicService.generateOrGet(userId, id);
        return ResponseEntity.ok(ApiResponse.ok(new MnemonicResponse(path), "연상 이미지가 준비되었습니다."));
    }
}
