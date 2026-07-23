package com.jjikboka.app.cards;

/**
 * 캡처 분석 접수 응답 (Notion API-ID 6). 비동기 202 — 실제 카드는 워커가 만들고 폴링(39)·SSE(40)로 받는다.
 * ApiResponse로 감싸져 {@code { success, data:{ jobId, status }, message }} 형태가 된다.
 * jobId는 03 ERD의 analyze_job.id(BIGINT)와 정합하는 Long이며, 상태는 접수 직후 항상 "PENDING".
 */
public record AnalyzeAcceptedResponse(Long jobId, String status) {

    static AnalyzeAcceptedResponse pending(Long jobId) {
        return new AnalyzeAcceptedResponse(jobId, "PENDING");
    }
}
