package com.jjikboka.app.cards;

import java.util.List;

/**
 * 카드 피드 응답 (Notion API-ID 7). ApiResponse로 감싸져 {@code { success, data:{ cards, total, hasNext }, message }} 형태가 된다.
 * cards는 카드 요약 + 시험 칩(exams)을 합친 {@link FeedCard} 목록 — 정답·풀이는 포함되지 않는다(13 §7).
 * total=필터 적용 후 전체 개수, hasNext=다음 페이지 존재 여부(무한 스크롤용).
 */
public record CardFeedResponse(List<FeedCard> cards, long total, boolean hasNext) {
}
