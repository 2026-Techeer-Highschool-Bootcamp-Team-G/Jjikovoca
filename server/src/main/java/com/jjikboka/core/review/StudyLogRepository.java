package com.jjikboka.core.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * study_log 저장소. package-private 봉인(13 §2). INSERT-only 원장이라 저장과 <b>집계 조회</b>만 쓴다 —
 * 월간 리포트(API-17)용 집계는 여기서(원장 소유), 조합·프리미엄 게이팅은 core.stats가 한다.
 */
interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    /** 기간 내 학습 기록 수(studyCount). */
    @Query("SELECT COUNT(s) FROM StudyLog s WHERE s.userId = :userId AND s.createdAt >= :start AND s.createdAt < :end")
    long countInPeriod(@Param("userId") Long userId,
                       @Param("start") LocalDateTime start,
                       @Param("end") LocalDateTime end);

    /**
     * 카드 타입별 정확도 집계 — [정답(KNOW) 수, 전체 수]. Card와 조인해 type으로 좁힌다(정확도.word/problem).
     * total=0이면 정확도는 null(호출부에서 판단).
     */
    @Query("SELECT SUM(CASE WHEN s.result = 'KNOW' THEN 1 ELSE 0 END), COUNT(s) "
            + "FROM StudyLog s, Card c WHERE s.cardId = c.id AND c.type = :type "
            + "AND s.userId = :userId AND s.createdAt >= :start AND s.createdAt < :end")
    Object[] accuracyByType(@Param("userId") Long userId,
                            @Param("type") String type,
                            @Param("start") LocalDateTime start,
                            @Param("end") LocalDateTime end);

    /** 오답 사유별 집계 — [reasonTag, count]. reason_tag가 있는 것만. */
    @Query("SELECT s.reasonTag, COUNT(s) FROM StudyLog s WHERE s.userId = :userId "
            + "AND s.reasonTag IS NOT NULL AND s.createdAt >= :start AND s.createdAt < :end GROUP BY s.reasonTag")
    List<Object[]> reasonBreakdown(@Param("userId") Long userId,
                                   @Param("start") LocalDateTime start,
                                   @Param("end") LocalDateTime end);

    /** 잔디(F-12) — 일자별 학습 수 [date, count]. */
    @Query("SELECT FUNCTION('DATE', s.createdAt), COUNT(s) FROM StudyLog s WHERE s.userId = :userId "
            + "AND s.createdAt >= :start AND s.createdAt < :end GROUP BY FUNCTION('DATE', s.createdAt) "
            + "ORDER BY FUNCTION('DATE', s.createdAt)")
    List<Object[]> grassCounts(@Param("userId") Long userId,
                               @Param("start") LocalDateTime start,
                               @Param("end") LocalDateTime end);
}
