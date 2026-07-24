package com.jjikboka.core.stats;

import java.util.List;

/**
 * 리포트 기본 지표 (Notion API-ID 17). 무료·프리미엄 공통 — 새 카드·학습 수·정확도·과목별 학습 비중(도넛).
 * subjectBreakdown은 study_log⨝card를 subject로 집계한 것(전체 대비 비율 포함), 학습 없으면 빈 리스트.
 */
public record ReportBasic(long newCards, long studyCount, Accuracy accuracy, List<SubjectStat> subjectBreakdown) {
}
