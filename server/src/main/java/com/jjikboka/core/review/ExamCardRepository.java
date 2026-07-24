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

    /** 시험에 태깅된 카드 id들(시험복습 42·피드 examId 필터용). */
    @Query("SELECT ec.cardId FROM ExamCard ec WHERE ec.examId = :examId")
    List<Long> findCardIdsByExamId(@Param("examId") Long examId);

    /** 이 사용자의 카드 중 시험에 태깅된 카드 id들(피드 untagged 필터용 — 이 집합의 여집합이 미태깅). */
    @Query("SELECT DISTINCT ec.cardId FROM ExamCard ec, Card c WHERE ec.cardId = c.id AND c.userId = :userId")
    List<Long> findTaggedCardIdsByUser(@Param("userId") Long userId);

    /** 여러 카드에 걸린 시험들(피드 exams 칩 배치 enrich) — [cardId, Exam]. */
    @Query("SELECT ec.cardId, e FROM Exam e, ExamCard ec WHERE ec.examId = e.id AND ec.cardId IN :cardIds "
            + "ORDER BY e.examDate ASC")
    List<Object[]> findExamsByCardIds(@Param("cardIds") List<Long> cardIds);
}
