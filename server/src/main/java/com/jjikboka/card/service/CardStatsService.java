package com.jjikboka.card.service;

import com.jjikboka.card.dto.WeakConceptDiagnosis;
import com.jjikboka.card.repository.CardRepository;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

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

    /** 오늘 복습 대기 수(API-17 todayDue) — next_review_at 도래·미졸업 카드. 복습 큐 dueCount와 동일 값. */
    @Transactional(readOnly = true)
    public long reviewDue(Long userId, LocalDateTime now) {
        return cardRepository.countReviewDue(userId, now);
    }

    /**
     * 평균 회상확률(API-6b 추천). FSRS 제거(영어 전용, Leitner box 단일화)로 회상확률(R) 지표는 산출하지 않는다 —
     * 하위호환을 위해 항상 null을 돌려준다(호출부가 null이면 미표시).
     */
    @Transactional(readOnly = true)
    public Double averageRecall(Long userId, LocalDateTime now) {
        return null;
    }

    /**
     * 특정 카드 집합의 평균 회상확률(시험범위 기억률). FSRS 제거로 회상확률(R) 지표는 산출하지 않는다 —
     * 하위호환을 위해 항상 null을 돌려준다.
     */
    @Transactional(readOnly = true)
    public Double averageRecallOf(Long userId, java.util.Collection<Long> cardIds, LocalDateTime now) {
        return null;
    }

    /** 약한 개념(API-17 full) — concept·subject 그룹의 wrong_count 합 상위 N개(내림차순). GROUP BY가 중복을 이미 제거. */
    @Transactional(readOnly = true)
    public List<WeakConceptDiagnosis> weakConcepts(Long userId) {
        return cardRepository.findWeakConceptStats(userId, PageRequest.of(0, WEAK_CONCEPT_LIMIT)).stream()
                .map(row -> new WeakConceptDiagnosis((String) row[0], (String) row[1], ((Number) row[2]).longValue()))
                .toList();
    }
}
