package com.jjikboka.core.card;

/**
 * 빈칸 답 판정 결과 (Notion API-ID 15, core.card 공개 DTO). 채점 후이므로 정답 단어(word)를 공개한다 —
 * 정답 입력 후 공개 원칙(13 §7). 전이된 복습 상태는 {@link CardReviewState}로 함께 넘긴다.
 */
public record ClozeAnswerResult(
        boolean correct,
        String word,
        CardReviewState state
) {
}
