package com.jjikboka.core.review;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * 시험 조회 결과 (Notion API-ID 32~35, core.review 공개 DTO). dday는 오늘 기준 남은 일수라 조회 시점에 계산한다.
 * app이 그대로 목록/등록/수정 응답에 쓴다(subject=null은 전과목).
 *
 * <p>memoryRate=시험범위 기억률(태깅 카드들의 FSRS R 평균, 0~1). from()은 null로 두고, 목록 조립 시 app이 채운다
 * (기억률은 카드 도메인 소관이라 여기서 계산하지 않는다, 13 §2). 등록/수정 응답에선 null.
 */
public record ExamView(
        Long id,
        String title,
        String subject,
        LocalDate examDate,
        long dday,
        Double memoryRate
) {

    static ExamView from(Exam exam) {
        long dday = ChronoUnit.DAYS.between(LocalDate.now(), exam.getExamDate());
        return new ExamView(exam.getId(), exam.getTitle(), exam.getSubject(), exam.getExamDate(), dday, null);
    }

    /** 시험범위 기억률을 채운 사본 — app이 목록 조립 시 계산해 넣는다. */
    public ExamView withMemoryRate(Double memoryRate) {
        return new ExamView(id, title, subject, examDate, dday, memoryRate);
    }
}
