package com.jjikboka.core.card;

import java.util.List;

/**
 * 수학 복습 큐 항목 (Notion API-ID 29, core.card 공개 DTO). 문제 수식·이미지·풀이 골격·진단을 담는다.
 * <b>solutions는 masked(단계 content·해설 제거)</b>이고 answerValue는 아예 없다 — 비노출 계약(13 §7).
 * 단계 content는 공개(30), 정답·해설은 판정(31) 시점에만 드러난다.
 */
public record MathCard(
        Long cardId,
        String latex,
        String imagePath,
        List<Solution> solutions,
        MathDiagnosis diagnosis
) {
}
