package com.jjikboka.core.review;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * exam_card 저장소. package-private 봉인(13 §2). 태깅은 멱등이라 존재 확인 후 저장, 해제는 존재 시 삭제한다.
 */
interface ExamCardRepository extends JpaRepository<ExamCard, ExamCardId> {

    boolean existsByExamIdAndCardId(Long examId, Long cardId);

    void deleteByExamIdAndCardId(Long examId, Long cardId);

    List<ExamCard> findByCardId(Long cardId);
}
