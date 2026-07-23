package com.jjikboka.app.cards;

import com.jjikboka.core.card.CardSummary;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/**
 * 분석 작업 폴링 응답 (Notion API-ID 39). ApiResponse로 감싸져 {@code { success, data:{ ... }, message }} 형태가 된다.
 * status에 따라 실린 필드가 다르다 — COMPLETED면 cards·model, FAILED면 error, 진행 중이면 status만.
 * 값이 없는 필드는 응답에서 생략한다(NON_NULL).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AnalyzeJobResponse(
        String status,
        List<CardSummary> cards,
        String model,
        String error
) {

    static AnalyzeJobResponse inProgress(String status) {
        return new AnalyzeJobResponse(status, null, null, null);
    }

    static AnalyzeJobResponse completed(List<CardSummary> cards, String model) {
        return new AnalyzeJobResponse("COMPLETED", cards, model, null);
    }

    static AnalyzeJobResponse failed(String error) {
        return new AnalyzeJobResponse("FAILED", null, null, error);
    }
}
