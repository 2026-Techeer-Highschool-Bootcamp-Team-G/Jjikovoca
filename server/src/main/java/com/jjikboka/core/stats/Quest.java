package com.jjikboka.core.stats;

/**
 * 일일 퀘스트 (core.stats 공개 DTO, API-19). 홈 게임상태(F-16)의 "오늘의 목표" 진행도로 쓴다.
 * 지금은 일일 학습 목표(오늘 XP 획득) — progress=오늘 획득 XP, target=일일 한도, completed=목표 달성.
 * 복습 개수 기반 퀘스트는 exp+card 조합이라 app-facade 후속.
 */
public record Quest(String label, int progress, int target, boolean completed) {
}
