package com.jjikboka.core.card;

/**
 * 카드 상태 카운트 (core.card 공개 DTO, API-7 상태칩). 오답노트/직접선택 화면의 필터 배지 숫자로 쓴다.
 * total=전체(soft-delete 제외), graduated=졸업 완료, reviewDue=오늘 복습 대기(next_review 도래·미졸업).
 */
public record CardCounts(long total, long graduated, long reviewDue) {
}
