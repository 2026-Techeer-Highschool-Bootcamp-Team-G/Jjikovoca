package com.jjikboka.core.card;

import java.time.LocalDateTime;

/**
 * 복습 전이 결과 (Notion API-ID 11, core.card 공개 DTO). 라이트너 전이 후의 카드 복습 상태를 담아 app에 넘긴다.
 * app이 그대로 학습 기록 응답 data로 쓴다 — {@code { cardId, boxLevel, nextReviewAt, graduated }}.
 */
public record CardReviewState(
        Long cardId,
        int boxLevel,
        LocalDateTime nextReviewAt,
        boolean graduated
) {

    static CardReviewState from(Card card) {
        return new CardReviewState(card.getId(), card.getBoxLevel(), card.getNextReviewAt(), card.isGraduated());
    }
}
