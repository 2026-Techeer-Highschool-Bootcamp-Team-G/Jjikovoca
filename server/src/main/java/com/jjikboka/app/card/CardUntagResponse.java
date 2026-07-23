package com.jjikboka.app.card;

/**
 * 카드 시험 태깅 해제 응답 (Notion API-ID 44). 제외한 카드·시험 id를 돌려준다.
 */
public record CardUntagResponse(Long cardId, Long examId) {
}
