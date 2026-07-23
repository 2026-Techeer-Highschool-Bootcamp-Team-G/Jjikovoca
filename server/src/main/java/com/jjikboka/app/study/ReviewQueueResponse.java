package com.jjikboka.app.study;

import com.jjikboka.core.card.ReviewQueueItem;

import java.util.List;

/**
 * 오늘의 복습 큐 응답 (Notion API-ID 13). ApiResponse로 감싸져 {@code { success, data:{ dueCount, cards }, message }} 형태가 된다.
 * dueCount는 오늘 복습 대상 수 — 피드 상단 배너에 연동된다.
 */
public record ReviewQueueResponse(int dueCount, List<ReviewQueueItem> cards) {

    static ReviewQueueResponse of(List<ReviewQueueItem> cards) {
        return new ReviewQueueResponse(cards.size(), cards);
    }
}
