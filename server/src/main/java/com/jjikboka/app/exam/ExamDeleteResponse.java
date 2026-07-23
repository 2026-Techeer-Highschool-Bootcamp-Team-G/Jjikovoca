package com.jjikboka.app.exam;

/**
 * 시험 삭제 응답 (Notion API-ID 35). 삭제된 시험 id + 기본 일정으로 복원된 카드 수(rescheduledCount)를 담는다.
 */
public record ExamDeleteResponse(Long deletedId, int rescheduledCount) {
}
