package com.jjikboka.core.review;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

/**
 * 시험 (03 exam, F-19). 사용자의 시험 일정 — 등록 시 서버가 시험일 역산으로 복습을 재배치한다(재배치는 core.card).
 * subject=null은 전과목. @Entity는 core.review 밖에서 비공개 — 노출은 조회 서비스의 DTO로만(13 §2).
 */
@Entity
@Table(name = "exam")
class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String title;

    @Column
    private String subject;

    @Column(name = "exam_date", nullable = false)
    private LocalDate examDate;

    protected Exam() {
    }

    static Exam create(Long userId, String title, String subject, LocalDate examDate) {
        Exam exam = new Exam();
        exam.userId = userId;
        exam.title = title;
        exam.subject = subject;
        exam.examDate = examDate;
        return exam;
    }

    /** 부분 수정(API-34) — null인 필드는 그대로 둔다. */
    void update(String title, String subject, LocalDate examDate) {
        if (title != null) {
            this.title = title;
        }
        if (subject != null) {
            this.subject = subject;
        }
        if (examDate != null) {
            this.examDate = examDate;
        }
    }

    Long getId() {
        return id;
    }

    Long getUserId() {
        return userId;
    }

    String getTitle() {
        return title;
    }

    String getSubject() {
        return subject;
    }

    LocalDate getExamDate() {
        return examDate;
    }
}
