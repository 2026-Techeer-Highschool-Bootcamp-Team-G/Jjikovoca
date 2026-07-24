package com.jjikboka.app.study;

import com.jjikboka.core.card.CardStatsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 학습 추천 조립 (API-6b, app 파사드). 복습 대기 수·평균 회상확률(core.card)로 홈 추천 요약을 만든다.
 * 예상 시간은 카드당 heuristic(30초)로 파생 — 밸런스 기획 확정 전 placeholder.
 */
@Service
public class RecommendationService {

    /** 카드당 예상 학습 시간(분) — 30초 heuristic(밸런스 기획 전 placeholder). */
    private static final double MINUTES_PER_CARD = 0.5;

    private final CardStatsService cardStatsService;

    RecommendationService(CardStatsService cardStatsService) {
        this.cardStatsService = cardStatsService;
    }

    @Transactional(readOnly = true)
    public RecommendationResponse recommend(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        long reviewCount = cardStatsService.reviewDue(userId, now);
        Double memoryRate = cardStatsService.averageRecall(userId, now);
        int estimatedMinutes = (int) Math.ceil(reviewCount * MINUTES_PER_CARD);
        return new RecommendationResponse(reviewCount, memoryRate, estimatedMinutes);
    }
}
