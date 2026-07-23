package com.jjikboka.core.review;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * 학습 이력 원장 (03 study_log, API-11). 모든 복습 활동을 INSERT-only로 남긴다 — 수정·삭제 없음(통계·리포트 근거).
 * card_id·user_id는 값으로 들고(크로스 경계 최소화), 판정 결과·오답 원인·풀이시간·F-26 단계 로그(detail JSON)를 기록한다.
 * @Entity는 core.review 밖에서 비공개(13 §2).
 */
@Entity
@Table(name = "study_log")
class StudyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "card_id", nullable = false)
    private Long cardId;

    @Column(nullable = false)
    private String activity;

    @Column(nullable = false)
    private String result;

    @Column(name = "reason_tag")
    private String reasonTag;

    @Column(name = "duration_ms")
    private Integer durationMs;

    @Column(columnDefinition = "json")
    private String detail;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    protected StudyLog() {
    }

    /** 새 학습 이력 한 줄. detail은 F-26 MATH_REVIEW 등에서 오는 JSON 문자열(없으면 null). */
    static StudyLog of(StudyRecordCommand command) {
        StudyLog log = new StudyLog();
        log.userId = command.userId();
        log.cardId = command.cardId();
        log.activity = command.activity();
        log.result = command.result();
        log.reasonTag = command.reasonTag();
        log.durationMs = command.durationMs();
        log.detail = command.detail();
        return log;
    }
}
