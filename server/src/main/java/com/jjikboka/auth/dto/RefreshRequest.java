package com.jjikboka.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 토큰 재발급 요청 (Notion API-ID 37). 만료된 access로도 호출하므로 인증 불필요 —
 * 신원은 refreshToken 자체(JWT 서명·저장소 존재)로 검증한다.
 */
public record RefreshRequest(

        @NotBlank
        String refreshToken
) {
}
