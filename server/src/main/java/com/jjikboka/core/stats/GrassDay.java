package com.jjikboka.core.stats;

import java.time.LocalDate;

/**
 * 잔디 한 칸 (Notion API-ID 17, F-12). 일자별 학습 수·학습 분 — 리포트/홈 잔디·주간 일별 학습시간 막대의 데이터 소스.
 * minutes=해당 일자 duration_ms 합/60000. (잔디 색 강도 임계는 프론트 렌더링 결정 — 서버는 count·minutes만 제공.)
 */
public record GrassDay(LocalDate date, long count, int minutes) {
}
