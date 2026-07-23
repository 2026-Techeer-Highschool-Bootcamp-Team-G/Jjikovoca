package com.jjikboka.core.review;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * 시험↔카드 매핑 (03 exam_card, F-29). 다대다 — 한 카드가 여러 시험에 걸린다.
 * source=AUTO(캡처 시 활성 시험 자동)·MANUAL(수동 태깅). 수동은 자동 재태깅에 덮이지 않는다.
 * @Entity·복합키는 core.review 밖에서 비공개(13 §2).
 */
@Entity
@Table(name = "exam_card")
@IdClass(ExamCardId.class)
class ExamCard {

    @Id
    @Column(name = "exam_id")
    private Long examId;

    @Id
    @Column(name = "card_id")
    private Long cardId;

    @Column(nullable = false)
    private String source;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    protected ExamCard() {
    }

    /** 수동 태깅(API-43·45) — source=MANUAL. */
    static ExamCard manual(Long examId, Long cardId) {
        ExamCard mapping = new ExamCard();
        mapping.examId = examId;
        mapping.cardId = cardId;
        mapping.source = "MANUAL";
        return mapping;
    }
}
