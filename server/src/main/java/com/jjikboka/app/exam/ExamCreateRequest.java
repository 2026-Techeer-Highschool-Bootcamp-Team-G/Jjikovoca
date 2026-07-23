package com.jjikboka.app.exam;

/**
 * 시험 등록 요청 (Notion API-ID 33). title·examDate는 필수, subject는 선택(null=전과목).
 * examDate 형식(YYYY-MM-DD)·필수 누락은 서비스에서 400 INVALID_EXAM_DATE로 던진다.
 */
public record ExamCreateRequest(
        String title,
        String subject,
        String examDate
) {
}
