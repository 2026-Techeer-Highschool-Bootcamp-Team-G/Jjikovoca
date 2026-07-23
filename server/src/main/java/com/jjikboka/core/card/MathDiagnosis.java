package com.jjikboka.core.card;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * 수학 풀이 진단 (F-18, card.diagnosis). 어느 단계에서 막혔는지·원인 설명·제안 오답 사유를 담는다.
 * 큐·판정 응답에 함께 실려 오답노트 진단을 보여준다(정답 content와 달리 진단 자체는 노출 대상).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record MathDiagnosis(
        Integer failedStep,
        String description,
        String suggestedReason
) {
}
