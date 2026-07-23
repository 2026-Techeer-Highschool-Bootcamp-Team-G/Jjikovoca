package com.jjikboka.core.stats;

/**
 * 성장 지표 (Notion API-ID 17). memorizedDelta는 전월 대비 증감(전월 비교는 후속이라 현재 null),
 * message는 이번 달 성과 문구(졸업 수 기반).
 */
public record Growth(Integer memorizedDelta, String message) {
}
