package com.jjikboka.core.card;

import org.springframework.data.jpa.repository.JpaRepository;

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
}
