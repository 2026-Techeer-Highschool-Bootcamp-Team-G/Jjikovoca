package com.jjikboka.core.review;

import java.io.Serializable;
import java.util.Objects;

/**
 * exam_card 복합 식별자 (03 exam_card PK: exam_id + card_id). {@link ExamCard}의 @IdClass.
 * 한 카드가 여러 시험에, 한 시험이 여러 카드에 걸리는 다대다를 이 쌍으로 표현한다(F-29).
 */
class ExamCardId implements Serializable {

    private Long examId;
    private Long cardId;

    protected ExamCardId() {
    }

    ExamCardId(Long examId, Long cardId) {
        this.examId = examId;
        this.cardId = cardId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ExamCardId that)) {
            return false;
        }
        return Objects.equals(examId, that.examId) && Objects.equals(cardId, that.cardId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(examId, cardId);
    }
}
