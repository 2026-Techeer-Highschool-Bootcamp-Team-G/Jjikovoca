package com.jjikboka.core.stats;

/**
 * 리포트 기본 지표 (Notion API-ID 17). 무료·프리미엄 공통 — 새 카드·학습 수·정확도.
 */
public record ReportBasic(long newCards, long studyCount, Accuracy accuracy) {
}
