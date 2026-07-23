package com.jjikboka.core.card;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 시험일 역산 복습 재배치 (core.card 공개 진입점, API-33~35). next_review_at은 card 소유라 재배치도 여기서 한다 —
 * 시험 CRUD(core.review)와 app이 한 트랜잭션으로 엮는다.
 *
 * <p><b>pre-FSRS 간단 구현</b>: 대상 카드(과목별·미졸업·active)의 next_review_at을 지금~시험일 사이로 균등 분산한다.
 * FSRS D-day 역산(기억률 기반)으로 나중에 교체되며, 그때도 이 계약(대상·count)은 그대로다.
 */
@Service
public class ExamRescheduler {

    private final CardRepository cardRepository;

    ExamRescheduler(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    /** 시험일 이전으로 복습을 당겨 균등 분산하고, 재배치한 카드 수를 돌려준다. subject=null은 전과목. */
    @Transactional
    public int rescheduleBefore(Long userId, String subject, LocalDate examDate) {
        List<Card> cards = cardRepository.findReschedulable(userId, subject);
        if (cards.isEmpty()) {
            return 0;
        }
        LocalDateTime now = LocalDateTime.now();
        long spanMinutes = Duration.between(now, examDate.atStartOfDay()).toMinutes();
        if (spanMinutes <= 0) {
            cards.forEach(card -> card.scheduleReviewAt(now));   // 시험일이 지났거나 오늘 → 즉시 복습
            return cards.size();
        }
        for (int i = 0; i < cards.size(); i++) {
            long offset = spanMinutes * (i + 1) / (cards.size() + 1);
            cards.get(i).scheduleReviewAt(now.plusMinutes(offset));
        }
        return cards.size();
    }

    /** 시험 삭제 시 대상 카드를 근접 기본 일정(내일)으로 복원하고, 복원한 카드 수를 돌려준다(pre-FSRS). */
    @Transactional
    public int restoreDefault(Long userId, String subject) {
        List<Card> cards = cardRepository.findReschedulable(userId, subject);
        LocalDateTime tomorrow = LocalDateTime.now().plusDays(1);
        cards.forEach(card -> card.scheduleReviewAt(tomorrow));
        return cards.size();
    }
}
