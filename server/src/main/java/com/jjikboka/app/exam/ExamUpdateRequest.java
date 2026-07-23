package com.jjikboka.app.exam;

/**
 * 시험 수정 요청 (Notion API-ID 34). 변경할 필드만 보낸다 — null은 그대로 둔다.
 * examDate가 오면 형식 검증(YYYY-MM-DD) 후 역산 재배치를 재실행한다.
 */
public record ExamUpdateRequest(
        String title,
        String subject,
        String examDate
) {
}
