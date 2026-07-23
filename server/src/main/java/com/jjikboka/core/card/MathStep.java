package com.jjikboka.core.card;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * 수학 사고 단계 (F-26, API-29·30). 단계 번호·제목·유도 질문은 큐에서도 보이지만,
 * <b>content(정답으로 이어지는 실제 내용)는 단계 공개(30) 시점에만</b> 채운다 — 비노출 계약(13 §7).
 * null 필드는 응답에서 생략한다(NON_NULL) — 큐 응답의 단계엔 content가 빠진다.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record MathStep(
        int no,
        String title,
        String question,
        String content
) {

    /** content를 가린 큐용 단계(공개 전). */
    MathStep withoutContent() {
        return new MathStep(no, title, question, null);
    }
}
