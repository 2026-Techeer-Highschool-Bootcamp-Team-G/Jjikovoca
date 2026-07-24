package com.jjikboka.core.card;

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

    /** 오늘 복습 대기 수(API-17 todayDue) — FSRS next_review_at 도래·미졸업 카드. 복습 큐 dueCount와 동일 값. */
    @Transactional(readOnly = true)
    public long reviewDue(Long userId, LocalDateTime now) {
        return cardRepository.countReviewDue(userId, now);
    }

    /** wrong_count 상위 카드의 concept를 중복 제거해 상위 N개. */
    @Transactional(readOnly = true)
    public List<String> weakConcepts(Long userId) {
        return cardRepository.findWeakConcepts(userId, PageRequest.of(0, 30)).stream()
                .distinct()
                .limit(WEAK_CONCEPT_LIMIT)
                .toList();
    }
}
