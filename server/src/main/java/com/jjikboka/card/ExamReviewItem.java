package com.jjikboka.card;

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
        // recallProb는 FSRS R(t)이었으나 FSRS 제거(Leitner 단일화)로 항상 null(계약 필드는 하위호환 유지).
        return new ExamReviewItem(card.getId(), card.getSubject(),
                null, card.getNextReviewAt());
    }
}
