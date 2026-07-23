package com.jjikboka.app.study;

import com.jjikboka.core.card.FlashcardItem;

import java.util.List;

/**
 * 플래시카드 큐 응답 (Notion API-ID 12). ApiResponse로 감싸져 {@code { success, data:{ total, cards }, message }} 형태가 된다.
 * total은 이번 응답에 담긴 카드 수(limit 적용 후).
 */
public record FlashcardQueueResponse(int total, List<FlashcardItem> cards) {

    static FlashcardQueueResponse of(List<FlashcardItem> cards) {
        return new FlashcardQueueResponse(cards.size(), cards);
    }
}
