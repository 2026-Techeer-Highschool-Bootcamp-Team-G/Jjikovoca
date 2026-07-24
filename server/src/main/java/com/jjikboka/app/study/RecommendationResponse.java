package com.jjikboka.app.study;

/**
 * 학습 추천 요약 (API-6b, GET /api/study/recommendation). 홈에서 "오늘 뭘 학습할지" 한눈에 —
 * reviewCount=복습 대기 카드 수, memoryRate=활성 FSRS 카드 평균 회상확률(0~1, 없으면 null), estimatedMinutes=예상 학습 분.
 */
public record RecommendationResponse(long reviewCount, Double memoryRate, int estimatedMinutes) {
}
