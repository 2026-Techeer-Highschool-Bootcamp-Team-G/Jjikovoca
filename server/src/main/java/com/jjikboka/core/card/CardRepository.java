package com.jjikboka.core.card;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * card 저장소. package-private 봉인(13 §2). 피드는 soft-delete 제외·최신순이 기본 계약이다.
 * subject 필터는 ALL일 때 전체, 아니면 과목별 — 두 파생 쿼리로 나눈다.
 */
interface CardRepository extends JpaRepository<Card, Long> {

    List<Card> findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long userId);

    List<Card> findByUserIdAndSubjectAndDeletedAtIsNullOrderByCreatedAtDesc(Long userId, String subject);

    /** 상세 조회 — 삭제된 카드는 없는 것으로 본다(404). 소유자 검증은 조회 후 서비스에서(403). */
    Optional<Card> findByIdAndDeletedAtIsNull(Long id);

    /** 플래시카드 PICK(API-12, F-28) — 직접 고른 카드(소유·soft-delete 제외). 상태 교차 혼합이라 due·졸업 무관. */
    List<Card> findByUserIdAndIdInAndDeletedAtIsNullOrderByCreatedAtDesc(Long userId, List<Long> ids);

    /** 폴링(API-39) — 특정 분석 작업이 만든 카드들. soft-delete 제외·최신순. */
    List<Card> findByUserIdAndAnalyzeJobIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long userId, Long analyzeJobId);

    /**
     * 원문 보관함(API-36) — 해당 월[start, end) 안의 크롭 원문(image_path 존재) 카드를 최신순으로.
     * soft-delete 제외. 일자별 그룹핑은 서비스에서 한다.
     */
    @Query("SELECT c FROM Card c WHERE c.userId = :userId AND c.deletedAt IS NULL "
            + "AND c.imagePath IS NOT NULL AND c.createdAt >= :start AND c.createdAt < :end "
            + "ORDER BY c.createdAt DESC")
    List<Card> findArchive(@Param("userId") Long userId,
                           @Param("start") LocalDateTime start,
                           @Param("end") LocalDateTime end);

    /**
     * 플래시카드 큐(API-12) — 미졸업 WORD 중 due(next_review 도래 또는 미학습). subject가 null이면 전체.
     * 정렬은 몰라요 빈도순(wrong_count desc) → 오래된 순(created_at asc), limit은 Pageable로.
     */
    @Query("SELECT c FROM Card c WHERE c.userId = :userId AND c.type = 'WORD' "
            + "AND c.graduatedAt IS NULL AND c.deletedAt IS NULL "
            + "AND (:subject IS NULL OR c.subject = :subject) "
            + "AND (c.nextReviewAt IS NULL OR c.nextReviewAt <= :now) "
            + "ORDER BY c.wrongCount DESC, c.createdAt ASC")
    List<Card> findFlashcardQueue(@Param("userId") Long userId,
                                  @Param("subject") String subject,
                                  @Param("now") LocalDateTime now,
                                  Pageable pageable);

    /**
     * 오늘의 복습 큐(API-13) — 미졸업 중 next_review_at 도래(<= now)한 카드. 이른 순, limit은 Pageable로.
     * 미학습(null)은 아직 '복습' 대상이 아니라 제외한다(플래시카드 큐와 구분).
     */
    @Query("SELECT c FROM Card c WHERE c.userId = :userId "
            + "AND c.graduatedAt IS NULL AND c.deletedAt IS NULL "
            + "AND c.nextReviewAt IS NOT NULL AND c.nextReviewAt <= :now "
            + "ORDER BY c.nextReviewAt ASC")
    List<Card> findReviewQueue(@Param("userId") Long userId,
                               @Param("now") LocalDateTime now,
                               Pageable pageable);

    /**
     * 빈칸 퀴즈 문항 대상(API-14) — 예문 보유 미졸업 WORD 카드. 저장 예문을 재활용하므로 example 필수.
     * soft-delete 제외·최신순, limit은 Pageable로.
     */
    @Query("SELECT c FROM Card c WHERE c.userId = :userId AND c.type = 'WORD' "
            + "AND c.graduatedAt IS NULL AND c.deletedAt IS NULL AND c.example IS NOT NULL "
            + "ORDER BY c.createdAt DESC")
    List<Card> findClozeCandidates(@Param("userId") Long userId, Pageable pageable);

    /**
     * 수학 복습 큐(API-29) — 복습 대상 PROBLEM 카드(미졸업·due). next_review 도래 또는 미학습(null)까지 포함.
     * soft-delete 제외·최신순, limit은 Pageable로.
     */
    @Query("SELECT c FROM Card c WHERE c.userId = :userId AND c.type = 'PROBLEM' "
            + "AND c.graduatedAt IS NULL AND c.deletedAt IS NULL "
            + "AND (c.nextReviewAt IS NULL OR c.nextReviewAt <= :now) "
            + "ORDER BY c.createdAt DESC")
    List<Card> findMathQueue(@Param("userId") Long userId,
                             @Param("now") LocalDateTime now,
                             Pageable pageable);

    /**
     * 시험일 역산 재배치 대상(API-33~35) — 미졸업·active 카드. subject가 null이면 전과목, 아니면 해당 과목만.
     * 오래된 순으로 균등 분산하기 좋게 created_at 오름차순으로 준다.
     */
    @Query("SELECT c FROM Card c WHERE c.userId = :userId "
            + "AND c.graduatedAt IS NULL AND c.deletedAt IS NULL "
            + "AND (:subject IS NULL OR c.subject = :subject) "
            + "ORDER BY c.createdAt ASC")
    List<Card> findReschedulable(@Param("userId") Long userId, @Param("subject") String subject);

    /**
     * 넛지 소급 대상(API-45) — 최근(since 이후) 만들어진 미졸업·active 카드 id. subject가 null이면 전과목.
     */
    @Query("SELECT c.id FROM Card c WHERE c.userId = :userId "
            + "AND c.graduatedAt IS NULL AND c.deletedAt IS NULL "
            + "AND (:subject IS NULL OR c.subject = :subject) "
            + "AND c.createdAt >= :since")
    List<Long> findRecentCardIds(@Param("userId") Long userId,
                                 @Param("subject") String subject,
                                 @Param("since") LocalDateTime since);

    /**
     * 시험 대비 오늘 복습(API-42) — 주어진 카드들 중 소유·미졸업·due(next_review 도래). next_review 이른 순.
     */
    @Query("SELECT c FROM Card c WHERE c.userId = :userId AND c.id IN :cardIds "
            + "AND c.graduatedAt IS NULL AND c.deletedAt IS NULL "
            + "AND c.nextReviewAt IS NOT NULL AND c.nextReviewAt <= :now "
            + "ORDER BY c.nextReviewAt ASC")
    List<Card> findDueAmong(@Param("userId") Long userId,
                            @Param("cardIds") List<Long> cardIds,
                            @Param("now") LocalDateTime now,
                            Pageable pageable);

    /** 리포트(API-17) — 기간 내 새로 만든 카드 수(soft-delete 제외). */
    @Query("SELECT COUNT(c) FROM Card c WHERE c.userId = :userId AND c.deletedAt IS NULL "
            + "AND c.createdAt >= :start AND c.createdAt < :end")
    long countNewCards(@Param("userId") Long userId,
                       @Param("start") LocalDateTime start,
                       @Param("end") LocalDateTime end);

    /** 리포트(API-17) — 기간 내 졸업(graduated_at)한 카드 수. */
    @Query("SELECT COUNT(c) FROM Card c WHERE c.userId = :userId "
            + "AND c.graduatedAt >= :start AND c.graduatedAt < :end")
    long countGraduated(@Param("userId") Long userId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

    /** 리포트(API-17) — 약한 개념 후보: wrong_count 높은 카드의 concept(중복 가능, 상위부터). 서비스에서 distinct·상위 N. */
    @Query("SELECT c.concept FROM Card c WHERE c.userId = :userId AND c.deletedAt IS NULL "
            + "AND c.concept IS NOT NULL AND c.wrongCount > 0 ORDER BY c.wrongCount DESC")
    List<String> findWeakConcepts(@Param("userId") Long userId, Pageable pageable);

    /** 상태칩(API-7) — 전체 카드 수(soft-delete 제외). */
    long countByUserIdAndDeletedAtIsNull(Long userId);

    /** 상태칩(API-7) — 졸업 완료 수(soft-delete 제외, 전 기간). */
    @Query("SELECT COUNT(c) FROM Card c WHERE c.userId = :userId AND c.deletedAt IS NULL AND c.graduatedAt IS NOT NULL")
    long countGraduatedTotal(@Param("userId") Long userId);

    /** 상태칩(API-7) — 오늘 복습 대기 수(next_review 도래·미졸업·soft-delete 제외). */
    @Query("SELECT COUNT(c) FROM Card c WHERE c.userId = :userId AND c.deletedAt IS NULL "
            + "AND c.graduatedAt IS NULL AND c.nextReviewAt IS NOT NULL AND c.nextReviewAt <= :now")
    long countReviewDue(@Param("userId") Long userId, @Param("now") LocalDateTime now);
}
