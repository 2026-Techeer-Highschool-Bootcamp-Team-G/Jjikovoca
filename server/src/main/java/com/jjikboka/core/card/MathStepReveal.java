package com.jjikboka.core.card;

/**
 * 사고 단계 공개 결과 (Notion API-ID 30, core.card 공개 DTO). 특정 풀이(solutionIndex)의 한 단계 content를
 * 이 시점에만 드러낸다 — 큐/조회에선 masked였던 것을 여기서 해제한다(13 §7).
 */
public record MathStepReveal(
        int solutionIndex,
        int no,
        String content
) {
}
