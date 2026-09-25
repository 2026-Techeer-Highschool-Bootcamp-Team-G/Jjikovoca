package com.jjikboka.auth.controller;

import com.jjikboka.auth.service.AuthService;

import com.jjikboka.auth.dto.AuthResponse;
import com.jjikboka.auth.dto.LoginRequest;
import com.jjikboka.auth.dto.LogoutRequest;
import com.jjikboka.auth.dto.RefreshRequest;
import com.jjikboka.auth.dto.RegisterRequest;
import com.jjikboka.auth.dto.TokenResponse;
import com.jjikboka.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * 인증·계정 API (F-01). 회원가입·로그인·토큰 재발급·로그아웃(/api/auth/*)과 계정 탈퇴(/api/account)를 한 컨트롤러로 묶는다 —
 * 모두 auth 도메인·AuthService에 위임한다(13 §2). 성공은 ApiResponse 래핑, 실패는 GlobalExceptionHandler.
 * 경로가 두 리소스(/api/auth, /api/account)라 클래스 레벨 매핑 없이 메서드별 전체 경로로 매핑한다.
 */
@RestController
class AuthController {

    private final AuthService authService;

    AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** 회원가입 (Notion API-ID 1) — 성공 200, 중복 409, 검증 400. */
    @PostMapping("/api/auth/register")
    ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse data = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok(data, "회원가입이 완료되었습니다."));
    }

    /** 로그인 (Notion API-ID 2) — 성공 200, 자격 실패 401(미구분). */
    @PostMapping("/api/auth/login")
    ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse data = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(data, "로그인이 완료되었습니다."));
    }

    /** 토큰 재발급 (Notion API-ID 37) — 성공 200, 만료·폐기·재사용 401. */
    @PostMapping("/api/auth/refresh")
    ResponseEntity<ApiResponse<TokenResponse>> refresh(@Valid @RequestBody RefreshRequest request) {
        TokenResponse data = authService.refresh(request);
        return ResponseEntity.ok(ApiResponse.ok(data, "토큰이 갱신되었습니다."));
    }

    /** 로그아웃 (Notion API-ID 38, 인증 필요) — refresh 폐기. 멱등(재요청도 200). */
    @PostMapping("/api/auth/logout")
    ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody LogoutRequest request) {
        authService.logout(userId, request.refreshToken());
        return ResponseEntity.ok(ApiResponse.<Void>ok(null, "로그아웃되었습니다."));
    }

    /**
     * 계정 탈퇴 (프론트 §6, 인증 필요) — JwtAuthenticationFilter가 실은 userId를 쓴다.
     * soft delete + refresh token 폐기는 AuthService에 위임한다.
     */
    @DeleteMapping("/api/account")
    ResponseEntity<ApiResponse<Void>> deleteAccount(@AuthenticationPrincipal Long userId) {
        authService.deleteAccount(userId);
        return ResponseEntity.ok(ApiResponse.ok(null, "회원 탈퇴가 완료되었습니다."));
    }
}
