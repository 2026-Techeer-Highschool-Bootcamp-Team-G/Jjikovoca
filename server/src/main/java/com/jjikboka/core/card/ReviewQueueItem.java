package com.jjikboka.core.card;

import java.time.LocalDateTime;

/**
 * 오늘의 복습 큐 항목 (Notion API-ID 13, core.card 공개 DTO). next_review_at 도래한 미졸업 카드 —
 * 피드 상단 배너("오늘 복습 N개")에 연동된다. word는 WORD만 채워지고 PROBLEM은 null이다.
 */
public record ReviewQueueItem(
        Long id,
        String word,
        int boxLevel,
        LocalDateTime nextReviewAt
) {

    static ReviewQueueItem from(Card card) {
        return new ReviewQueueItem(card.getId(), card.getWord(), card.getBoxLevel(), card.getNextReviewAt());
    }
}
