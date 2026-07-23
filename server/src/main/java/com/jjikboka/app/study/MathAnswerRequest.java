package com.jjikboka.app.study;

/**
 * 수학 정답 제출 요청 (Notion API-ID 31). answer 누락은 서비스 검증에서 400 MISSING_ANSWER로 던진다.
 * answer는 숫자·쉼표만(시스템 숫자 키패드) — NUMERIC은 순서 무관 집합 비교, CHOICE는 선택지 일치.
 */
public record MathAnswerRequest(
        String answer,
        Integer durationMs
) {
}
