package com.jjikboka.app.card;

import com.jjikboka.core.review.ExamTag;

import java.util.List;

/**
 * 카드 시험 태깅 응답 (Notion API-ID 43). 태깅 후 카드에 걸린 시험 태그 전체를 돌려준다.
 */
public record CardTagResponse(Long cardId, List<ExamTag> exams) {
}
