package com.jjikboka.auth;

import com.jjikboka.auth.dto.AuthResponse;
import com.jjikboka.auth.dto.LoginRequest;
import com.jjikboka.auth.dto.LogoutRequest;
import com.jjikboka.auth.dto.RefreshRequest;
import com.jjikboka.auth.dto.RegisterRequest;
import com.jjikboka.auth.dto.TokenResponse;
import com.jjikboka.shared.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 인증 API (F-01). Notion 명세 기준 — 성공은 ApiResponse 래핑, 실패는 GlobalExceptionHandler.
 */
@RestController
@RequestMapping("/api/auth")
class AuthController {

    private final AuthService authService;

    AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** 회원가입 (Notion API-ID 1) — 성공 200, 중복 409, 검증 400. */
    @PostMapping("/register")
    ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse data = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok(data, "회원가입이 완료되었습니다."));
    }

    /** 로그인 (Notion API-ID 2) — 성공 200, 자격 실패 401(미구분). */
    @PostMapping("/login")
    ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse data = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(data, "로그인이 완료되었습니다."));
    }

    /** 토큰 재발급 (Notion API-ID 37) — 성공 200, 만료·폐기·재사용 401. */
    @PostMapping("/refresh")
    ResponseEntity<ApiResponse<TokenResponse>> refresh(@Valid @RequestBody RefreshRequest request) {
        TokenResponse data = authService.refresh(request);
        return ResponseEntity.ok(ApiResponse.ok(data, "토큰이 갱신되었습니다."));
    }

    /** 로그아웃 (Notion API-ID 38, 인증 필요) — refresh 폐기. 멱등(재요청도 200). */
    @PostMapping("/logout")
    ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody LogoutRequest request) {
        authService.logout(userId, request.refreshToken());
        return ResponseEntity.ok(ApiResponse.<Void>ok(null, "로그아웃되었습니다."));
    }
}
