package com.jjikboka.core.card;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/**
 * 수학 풀이 (F-26, card.solutions 배열의 한 원소). 기본 풀이(index 0)와 다른 풀이(1+)를 담는다.
 * steps는 단계 목록, <b>explanation(해설)은 정답 판정(31) 이후에만</b> 공개한다 — 비노출 계약(13 §7).
 * null 필드는 응답에서 생략(NON_NULL) — 큐 응답의 풀이엔 explanation과 단계 content가 빠진다.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record Solution(
        int index,
        String label,
        List<MathStep> steps,
        String explanation
) {

    /** 큐용 — 각 단계 content와 해설을 가린 버전(공개 전). */
    Solution masked() {
        List<MathStep> maskedSteps = steps == null ? null : steps.stream().map(MathStep::withoutContent).toList();
        return new Solution(index, label, maskedSteps, null);
    }
}
