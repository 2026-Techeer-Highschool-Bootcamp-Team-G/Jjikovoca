package com.jjikboka.core.card;

/**
 * 약한 개념 (API-17 full, F-10 프리미엄 위젯). card를 concept·subject로 그룹핑해 낸 약점 —
 * concept(개념)·subject(과목)·wrongCount(그룹 wrong_count 합). 프론트 약점 진단에서 과목·틀린 횟수를 함께 표시.
 */
public record WeakConcept(String concept, String subject, long wrongCount) {
}
