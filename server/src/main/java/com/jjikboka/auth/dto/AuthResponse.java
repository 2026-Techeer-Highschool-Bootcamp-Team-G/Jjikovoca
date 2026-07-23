package com.jjikboka.auth.dto;

/**
 * 인증 성공 응답 data (Notion API-ID 1·2 기준). ApiResponse로 감싸져
 * {@code { success, data:{ accessToken, refreshToken, user }, message }} 형태가 된다.
 *
 * premium은 계산값(app_user 컬럼 아님 — subscription 판정). 신규 가입은 false.
 */
public record AuthResponse(String accessToken, String refreshToken, UserSummary user) {

    public record UserSummary(String email, String nickname, boolean premium) {
    }
}
