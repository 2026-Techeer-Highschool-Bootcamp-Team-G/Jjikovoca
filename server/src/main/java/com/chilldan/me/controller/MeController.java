package com.chilldan.me.controller;

import com.chilldan.common.response.ApiResponse;
import com.chilldan.me.dto.MeResponse;
import com.chilldan.me.service.MeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 내 정보 API (Notion API-ID 3). 인증 필요 — JwtAuthenticationFilter가 실은 userId를 넣는다.
 */
@RestController
@RequestMapping("/api/me")
class MeController {

    private final MeService meService;

    MeController(MeService meService) {
        this.meService = meService;
    }

    @GetMapping
    ResponseEntity<ApiResponse<MeResponse>> me(@AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(meService.getMe(userId)));
    }
}
