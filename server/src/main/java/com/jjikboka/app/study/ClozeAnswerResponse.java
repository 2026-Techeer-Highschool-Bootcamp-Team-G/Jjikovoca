package com.jjikboka.app.study;

import com.jjikboka.core.card.ClozeAnswerResult;

import java.time.LocalDateTime;

/**
 * 빈칸 답 제출 응답 (Notion API-ID 15). 판정 결과와 전이된 복습 상태를 한 객체로 평탄화한다 —
 * {@code { correct, word, cardId, boxLevel, nextReviewAt, graduated }}. 정답 단어는 채점 후이므로 공개한다(13 §7).
 */
public record ClozeAnswerResponse(
        boolean correct,
        String word,
        Long cardId,
        int boxLevel,
        LocalDateTime nextReviewAt,
        boolean graduated
) {

    static ClozeAnswerResponse from(ClozeAnswerResult result) {
        return new ClozeAnswerResponse(
                result.correct(),
                result.word(),
                result.state().cardId(),
                result.state().boxLevel(),
                result.state().nextReviewAt(),
                result.state().graduated());
    }
}
