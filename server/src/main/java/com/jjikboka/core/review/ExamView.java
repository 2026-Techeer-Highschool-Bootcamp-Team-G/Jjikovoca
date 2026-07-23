package com.jjikboka.core.review;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * 시험 조회 결과 (Notion API-ID 32~35, core.review 공개 DTO). dday는 오늘 기준 남은 일수라 조회 시점에 계산한다.
 * app이 그대로 목록/등록/수정 응답에 쓴다(subject=null은 전과목).
 */
public record ExamView(
        Long id,
        String title,
        String subject,
        LocalDate examDate,
        long dday
) {

    static ExamView from(Exam exam) {
        long dday = ChronoUnit.DAYS.between(LocalDate.now(), exam.getExamDate());
        return new ExamView(exam.getId(), exam.getTitle(), exam.getSubject(), exam.getExamDate(), dday);
    }
}
