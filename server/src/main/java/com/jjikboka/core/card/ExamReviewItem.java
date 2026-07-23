package com.jjikboka.core.card;

import java.time.LocalDateTime;

/**
 * 시험 대비 복습 항목 (Notion API-ID 42, core.card 공개 DTO). 이 시험 범위 카드 중 오늘 복습 대상.
 * recallProb(FSRS R(t))는 별도 산출(16_시험복습추천)이라 지금은 null — FSRS 도입 시 채운다(계약 불변).
 */
public record ExamReviewItem(
        Long cardId,
        String subject,
        Double recallProb,
        LocalDateTime nextReviewAt
) {

    static ExamReviewItem from(Card card) {
        return new ExamReviewItem(card.getId(), card.getSubject(), null, card.getNextReviewAt());
    }
}
