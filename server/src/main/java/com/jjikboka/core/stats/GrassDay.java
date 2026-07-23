package com.jjikboka.core.stats;

import java.time.LocalDate;

/**
 * 잔디 한 칸 (Notion API-ID 17, F-12). 일자별 학습 수 — 리포트/홈 잔디의 데이터 소스.
 */
public record GrassDay(LocalDate date, long count) {
}
