package com.jjikboka.core.review;

/**
 * 시험 태그 (Notion API-ID 43, core.review 공개 DTO). 카드에 걸린 시험을 id·title로 요약한다 —
 * 오답노트 행의 시험 칩·태깅 응답에 쓰인다.
 */
public record ExamTag(Long id, String title) {

    static ExamTag from(Exam exam) {
        return new ExamTag(exam.getId(), exam.getTitle());
    }
}
