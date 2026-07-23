package com.jjikboka.app.exam;

import com.jjikboka.core.card.ExamReviewItem;

import java.util.List;

/**
 * 시험 대비 오늘 복습 응답 (Notion API-ID 42). ApiResponse로 감싸져 {@code { success, data:{...}, message }} 형태가 된다.
 * dueCount는 오늘 복습 대상 수. recallProb(FSRS)는 각 항목에서 현재 null이다.
 */
public record ExamReviewResponse(Long examId, int dueCount, List<ExamReviewItem> cards) {

    static ExamReviewResponse of(Long examId, List<ExamReviewItem> cards) {
        return new ExamReviewResponse(examId, cards.size(), cards);
    }
}
