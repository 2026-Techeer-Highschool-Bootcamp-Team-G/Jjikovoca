package com.jjikboka.core.stats;

/**
 * 경험치 적립 델타 (API-11 study 응답, core.stats 공개 DTO). 이번 적립분(earned)·누적 exp(total)·레벨업 여부.
 * 정답이 아니면 earned=0(total은 현재값). 게이미 홈이 학습 직후 즉시 반영하는 데 쓴다.
 */
public record ExpDelta(int earned, int total, boolean levelUp) {
}
