package com.jjikboka.core.card;

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
}
