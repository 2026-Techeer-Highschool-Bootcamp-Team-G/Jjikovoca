package com.jjikboka.core.card;

/**
 * 카드 상태 카운트 (core.card 공개 DTO, API-7 단어장 칩). 단어장 필터 배지 숫자 — 모두 study_log 누적 등급 기준(제품 정의).
 * total=전체(soft-delete 제외), graduated=졸업완료(알아요≥4), reviewDue=복습대기(졸업 아님), weak=약점유형(몰라요+헷갈려요&gt;알아요).
 */
public record CardCounts(long total, long graduated, long reviewDue, long weak) {
}
