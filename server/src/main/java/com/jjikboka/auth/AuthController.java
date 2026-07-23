package com.jjikboka.auth;

import com.jjikboka.auth.dto.AuthResponse;
import com.jjikboka.auth.dto.RegisterRequest;
import com.jjikboka.shared.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
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
}
