package com.jjikboka.core.stats;

/**
 * 정확도 (Notion API-ID 17). 카드 타입별 정답률(KNOW/total) — 데이터가 없으면 null.
 */
public record Accuracy(Double word, Double problem) {
}
