package com.jjikboka.app.premium;

/**
 * 프리미엄 활성화 응답 (Notion API-ID 5). ApiResponse로 감싸져 {@code { success, data:{ premium }, message }} 형태가 된다.
 * premium은 계산값이며, 활성화 성공 시 항상 true.
 */
public record PremiumResponse(boolean premium) {
}
