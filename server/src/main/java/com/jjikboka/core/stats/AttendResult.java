package com.jjikboka.core.stats;

/**
 * 출석 결과 (Notion API-ID 18, core.stats 공개 DTO). earned는 이번 출석으로 얻은 경험치(멱등·한도 시 0),
 * total은 반영 후 누적 경험치, levelUp은 레벨 상승 여부, streakDays는 연속 학습일.
 */
public record AttendResult(int earned, int total, boolean levelUp, int streakDays) {
}
