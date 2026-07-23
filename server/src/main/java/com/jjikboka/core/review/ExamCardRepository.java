package com.jjikboka.core.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * exam_card 저장소. package-private 봉인(13 §2). 태깅은 멱등이라 존재 확인 후 저장, 해제는 존재 시 삭제한다.
 */
interface ExamCardRepository extends JpaRepository<ExamCard, ExamCardId> {

    boolean existsByExamIdAndCardId(Long examId, Long cardId);

    void deleteByExamIdAndCardId(Long examId, Long cardId);

    /** 카드에 걸린 시험들(태그 칩·태깅 응답용). 다가오는 순. */
    @Query("SELECT e FROM Exam e, ExamCard ec WHERE ec.examId = e.id AND ec.cardId = :cardId ORDER BY e.examDate ASC")
    List<Exam> findExamsByCardId(@Param("cardId") Long cardId);
}
