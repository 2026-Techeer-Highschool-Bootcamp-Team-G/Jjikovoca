package com.jjikboka.core.stats;

/**
 * 랭킹 원소 (Notion API-ID 20, core.stats 공개 DTO). userId와 순위 값(주간 획득 또는 레벨)만 담는다 —
 * 닉네임은 auth 소관이라 app이 조립 단계에서 붙인다(슬라이스 경계, 13 §2).
 */
public record RankEntry(Long userId, long value) {
}
