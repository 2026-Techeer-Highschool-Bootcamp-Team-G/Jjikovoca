package com.jjikboka.core.card;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 학습 큐 조회 (core.card 공개 진입점, API-12·13). 라이트너 전이가 갱신한 box·next_review_at·몰라요 빈도를
 * 학습 화면용으로 읽는다. 플래시카드는 미졸업 WORD의 due 큐, 복습 큐는 도래한 미졸업 카드다. 노출은 DTO로만(13 §2).
 */
@Service
public class StudyQueueService {

    private static final String SUBJECT_ALL = "ALL";

    private final CardRepository cardRepository;

    StudyQueueService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    /** 플래시카드 큐(API-12) — subject가 ALL/미지정이면 전체. limit만큼 몰라요 빈도순→오래된 순. */
    @Transactional(readOnly = true)
    public List<FlashcardItem> getFlashcards(Long userId, String subject, int limit) {
        String subjectFilter = (subject == null || SUBJECT_ALL.equals(subject)) ? null : subject;
        return cardRepository.findFlashcardQueue(userId, subjectFilter, LocalDateTime.now(), PageRequest.of(0, limit))
                .stream().map(FlashcardItem::from).toList();
    }

    /** 오늘의 복습 큐(API-13) — next_review_at 도래한 미졸업 카드를 이른 순으로 limit만큼. */
    @Transactional(readOnly = true)
    public List<ReviewQueueItem> getReviewQueue(Long userId, int limit) {
        return cardRepository.findReviewQueue(userId, LocalDateTime.now(), PageRequest.of(0, limit))
                .stream().map(ReviewQueueItem::from).toList();
    }
}
