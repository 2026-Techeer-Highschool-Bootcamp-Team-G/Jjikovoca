package com.jjikboka.core.stats;

/**
 * 빈칸 퀴즈 경험치 적립 결과 (API-15, core.stats 공개 DTO). 화면의 두 XP 배지를 그리도록 분해해서 준다 —
 * base(정답 기본)·comboBonus(연속 정답 보너스)·earned(실제 적립분, 일일 한도로 잘릴 수 있음)·total(누적)·levelUp.
 * 오답이면 base·comboBonus·earned 모두 0(total은 현재값).
 */
public record ClozeExp(int base, int comboBonus, int earned, int total, boolean levelUp) {
}
