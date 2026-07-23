package com.jjikboka.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 로그아웃 요청 (Notion API-ID 38). 폐기할 refresh 토큰을 담는다.
 * 인증(access)으로 누가 로그아웃하는지 확인하고, 이 refreshToken이 그 사용자의 것인지 검증한다.
 */
public record LogoutRequest(

        @NotBlank
        String refreshToken
) {
}
