package com.jjikboka.core.review;

/**
 * 과목별 학습 집계 (API-17 도넛, core.review 공개 DTO). study_log⨝card를 subject로 그룹핑한 원장 통계 —
 * minutes=학습 분(duration_ms 합/60000), count=학습 수. 비율(ratio)은 전체 대비라 core.stats가 조합 시 붙인다.
 */
public record SubjectMinutes(String subject, int minutes, long count) {
}
