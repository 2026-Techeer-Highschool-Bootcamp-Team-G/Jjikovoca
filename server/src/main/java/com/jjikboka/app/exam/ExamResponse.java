package com.jjikboka.app.exam;

import com.jjikboka.core.review.ExamView;

import java.time.LocalDate;

/**
 * 시험 등록·수정 응답 (Notion API-ID 33·34). 시험 정보 + dday + 역산 재배치된 카드 수(rescheduledCount)를 담는다.
 */
public record ExamResponse(
        Long id,
        String title,
        String subject,
        LocalDate examDate,
        long dday,
        int rescheduledCount
) {

    static ExamResponse of(ExamView view, int rescheduledCount) {
        return new ExamResponse(view.id(), view.title(), view.subject(), view.examDate(), view.dday(), rescheduledCount);
    }
}
