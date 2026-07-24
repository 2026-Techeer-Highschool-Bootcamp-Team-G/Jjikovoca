package com.jjikboka.core.stats;

import com.jjikboka.core.review.Rhythm;

import java.util.List;

/**
 * 리포트 기본 지표 (Notion API-ID 17). 무료·프리미엄 공통 — 새 카드·학습 수·정확도·과목별 학습 비중·오늘 학습 리듬·복습 대기.
 * subjectBreakdown은 study_log⨝card를 subject로 집계(전체 대비 비율 포함, 없으면 빈 리스트).
 * rhythm·todayDue는 기간과 무관한 "오늘" 값(홈 위젯 F-10) — 오늘 학습 분·세션 평균과 복습 대기 카드 수.
 */
public record ReportBasic(long newCards, long studyCount, Accuracy accuracy,
                          List<SubjectStat> subjectBreakdown, Rhythm rhythm, long todayDue) {
}
