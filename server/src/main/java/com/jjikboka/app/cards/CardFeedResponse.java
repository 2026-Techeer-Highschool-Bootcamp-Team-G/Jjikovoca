package com.jjikboka.app.cards;

import com.jjikboka.core.card.CardSummary;

import java.util.List;

/**
 * 카드 피드 응답 (Notion API-ID 7). ApiResponse로 감싸져 {@code { success, data:{ cards }, message }} 형태가 된다.
 * cards는 core.card가 만든 요약 DTO 목록 — 정답·풀이는 포함되지 않는다(13 §7).
 */
public record CardFeedResponse(List<CardSummary> cards) {
}
