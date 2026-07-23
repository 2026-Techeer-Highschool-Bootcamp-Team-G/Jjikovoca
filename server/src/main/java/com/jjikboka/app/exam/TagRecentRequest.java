package com.jjikboka.app.exam;

/**
 * 넛지 일괄 태깅 요청 (Notion API-ID 45). sinceDays는 소급 기간(일, 기본 14) — 최근 이 기간의 카드를 시험에 태깅한다.
 */
public record TagRecentRequest(Integer sinceDays) {
}
