package com.jjikboka.app.exam;

/**
 * 넛지 일괄 태깅 응답 (Notion API-ID 45). 시험 id와 태깅한 카드 수를 돌려준다.
 */
public record TagRecentResponse(Long examId, int taggedCount) {
}
