package com.jjikboka.core.card;

/**
 * 오늘의 AI 사용량 (core.card 공개 조회 결과). used=오늘 사용 횟수, limit=한도(free 5 · premium 100).
 */
public record QuotaStatus(int used, int limit) {
}
