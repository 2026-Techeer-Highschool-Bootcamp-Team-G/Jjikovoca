package com.jjikboka.core.card;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

/**
 * 월간 카드 집계 (core.card 공개 진입점, API-17). card에서 뽑는 리포트 통계 — 새 카드·졸업 수·약한 개념.
 * 조합·프리미엄 게이팅은 core.stats가 한다(카드는 여기 소유, 13 §2).
 */
@Service
public class CardStatsService {

    private static final int WEAK_CONCEPT_LIMIT = 3;

    private final CardRepository cardRepository;

    CardStatsService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    @Transactional(readOnly = true)
    public long newCards(Long userId, LocalDateTime start, LocalDateTime end) {
        return cardRepository.countNewCards(userId, start, end);
    }

    @Transactional(readOnly = true)
    public long graduated(Long userId, LocalDateTime start, LocalDateTime end) {
        return cardRepository.countGraduated(userId, start, end);
    }

    /** 오늘 복습 대기 수(API-17 todayDue) — FSRS next_review_at 도래·미졸업 카드. 복습 큐 dueCount와 동일 값. */
    @Transactional(readOnly = true)
    public long reviewDue(Long userId, LocalDateTime now) {
        return cardRepository.countReviewDue(userId, now);
    }

    /** 평균 회상확률(API-6b 추천) — 활성 FSRS 카드의 now 시점 R 평균(0~1, 소수 2자리). 대상 카드 없으면 null. */
    @Transactional(readOnly = true)
    public Double averageRecall(Long userId, LocalDateTime now) {
        List<Double> recalls = cardRepository.findActiveFsrsCards(userId).stream()
                .map(card -> card.currentRetrievability(now))
                .filter(Objects::nonNull)
                .toList();
        if (recalls.isEmpty()) {
            return null;
        }
        double avg = recalls.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        return BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    /** 약한 개념(API-17 full) — concept·subject 그룹의 wrong_count 합 상위 N개(내림차순). GROUP BY가 중복을 이미 제거. */
    @Transactional(readOnly = true)
    public List<WeakConcept> weakConcepts(Long userId) {
        return cardRepository.findWeakConceptStats(userId, PageRequest.of(0, WEAK_CONCEPT_LIMIT)).stream()
                .map(row -> new WeakConcept((String) row[0], (String) row[1], ((Number) row[2]).longValue()))
                .toList();
    }
}
