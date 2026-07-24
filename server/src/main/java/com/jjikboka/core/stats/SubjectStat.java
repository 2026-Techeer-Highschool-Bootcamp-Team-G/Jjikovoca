package com.jjikboka.core.stats;

/**
 * 과목별 학습 비중 (Notion API-ID 17, F-10 도넛). 리포트 과목 도넛의 한 조각 —
 * subject·학습 분(minutes)·학습 수(count)·전체 대비 비율(ratio, 0~1, 소수 2자리). 전체 0분이면 ratio 0.
 */
public record SubjectStat(String subject, int minutes, long count, double ratio) {
}
