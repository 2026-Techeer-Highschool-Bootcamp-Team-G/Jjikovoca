package com.jjikboka.core.card;

/**
 * 빈칸 답 판정 결과 (Notion API-ID 15, core.card 공개 DTO). 채점 후이므로 정답 단어(word)를 공개한다 —
 * 정답 입력 후 공개 원칙(13 §7). 전이된 복습 상태는 {@link CardReviewState}로 함께 넘긴다.
 *
 * <p>해설용으로 뜻(meaning=문맥 뜻)·예문 한글번역(exampleMeaning)도 함께 공개한다 — FE 채점 화면이 문항 데이터를
 * 들고 있지 않아도 "정답 단어 — 뜻 / 예문 속 쓰임"을 그릴 수 있게. exampleMeaning은 미채운 카드면 null(FE 숨김).
 */
public record ClozeAnswerResult(
        boolean correct,
        String word,
        String meaning,
        String exampleMeaning,
        CardReviewState state
) {
}
