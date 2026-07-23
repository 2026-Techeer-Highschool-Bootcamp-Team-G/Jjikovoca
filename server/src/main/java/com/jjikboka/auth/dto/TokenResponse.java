package com.jjikboka.auth.dto;

/**
 * 토큰 재발급 응답 data (Notion API-ID 37). 재발급은 신원 정보(user)를 다시 싣지 않고
 * 새 토큰 쌍만 돌려준다. ApiResponse로 감싸져 {@code { success, data:{ accessToken, refreshToken }, message }}.
 */
public record TokenResponse(String accessToken, String refreshToken) {
}
