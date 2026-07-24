package com.jjikboka.app.study;

import com.jjikboka.core.card.CardReviewState;
import com.jjikboka.core.stats.ExpDelta;

import java.time.LocalDateTime;

/**
 * 학습 기록 응답 (API-11). 기존 복습 상태(cardId·boxLevel·nextReviewAt·graduated)에 경험치 델타(exp)를 더한다 —
 * 게이미 홈이 학습 직후 exp를 즉시 반영(Phase 6a). 기존 필드는 그대로 유지(비파괴).
 */
public record StudyResultResponse(
        Long cardId,
        int boxLevel,
        LocalDateTime nextReviewAt,
        boolean graduated,
        ExpDelta exp
) {

    static StudyResultResponse of(CardReviewState state, ExpDelta exp) {
        return new StudyResultResponse(state.cardId(), state.boxLevel(), state.nextReviewAt(), state.graduated(), exp);
    }
}
