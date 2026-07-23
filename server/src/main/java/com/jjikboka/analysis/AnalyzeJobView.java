package com.jjikboka.analysis;

/**
 * 분석 작업 조회 결과 (analysis 공개 DTO, API-39 폴링). 소유자 검증을 통과한 job의 상태를 담아 app에 넘긴다.
 * status는 DB 원값(PENDING/RUNNING/DONE/FAILED) — 응답용 COMPLETED 매핑은 app이 한다(표현은 app 책임).
 */
public record AnalyzeJobView(Long jobId, String status) {
}
