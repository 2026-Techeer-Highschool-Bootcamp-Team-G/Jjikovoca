package com.jjikboka.app.health;

/**
 * 헬스체크 응답 (Notion API-ID 27). status는 "ok" 고정, aiMockMode는 모의 AI 모드 여부(gemini.mock).
 * ApiResponse로 감싸져 {@code { success, data:{ status, aiMockMode }, message }} 형태가 된다.
 */
public record HealthResponse(String status, boolean aiMockMode) {
}
