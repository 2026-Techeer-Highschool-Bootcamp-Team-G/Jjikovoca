package com.jjikboka.auth;

import com.jjikboka.shared.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 계정 탈퇴 API (프론트 §6). 인증 필요 — JwtAuthenticationFilter가 실은 userId를 쓴다.
 * soft delete + refresh token 폐기는 AuthService에 위임(auth 모듈 내부, 13 §2).
 */
@RestController
class AccountController {

    private final AuthService authService;

    AccountController(AuthService authService) {
        this.authService = authService;
    }

    @DeleteMapping("/api/account")
    ResponseEntity<ApiResponse<Void>> deleteAccount(@AuthenticationPrincipal Long userId) {
        authService.deleteAccount(userId);
        return ResponseEntity.ok(ApiResponse.ok(null, "회원 탈퇴가 완료되었습니다."));
    }
}
