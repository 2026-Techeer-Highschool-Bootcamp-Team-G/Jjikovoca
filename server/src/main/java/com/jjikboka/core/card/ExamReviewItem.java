package com.jjikboka.core.card;

import java.time.LocalDateTime;

/**
 * 시험 대비 복습 항목 (Notion API-ID 42, core.card 공개 DTO). 이 시험 범위 카드 중 오늘 복습 대상.
 * recallProb는 now 시점 FSRS R(t) — FSRS 카드만 채워지고 Lightner·미복습 카드는 null이다(계약 불변).
 */
public record ExamReviewItem(
        Long cardId,
        String subject,
        Double recallProb,
        LocalDateTime nextReviewAt
) {

    static ExamReviewItem from(Card card, LocalDateTime now) {
        return new ExamReviewItem(card.getId(), card.getSubject(),
                card.currentRetrievability(now), card.getNextReviewAt());
    }
}
