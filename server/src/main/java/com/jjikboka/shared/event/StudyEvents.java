package com.jjikboka.shared.event;

/**
 * 학습 원장 이벤트 계약 (13 §6). study_log INSERT 같은 학습 활동이 일어났음을 알린다 —
 * 지금은 캐시 무효화(월간 리포트 evict) 소비자가 쓴다. 도메인 간 공용 계약이라 shared에 둔다(어느 도메인에도 비속).
 */
public final class StudyEvents {

    /** core.review 발행 — study_log가 기록됨(학습/복습 활동). 리포트·집계 캐시 무효화 신호. */
    public record StudyRecorded(Long userId) {}

    private StudyEvents() {}
}
