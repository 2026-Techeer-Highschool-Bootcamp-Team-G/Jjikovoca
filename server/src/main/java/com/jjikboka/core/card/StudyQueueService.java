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

    private static final String MODE_PICK = "PICK";

    /**
     * 플래시카드 큐(API-12). TODAY(기본)는 미졸업 WORD의 due를 몰라요 빈도순→오래된 순으로, PICK은 직접 고른 카드(cardIds)를
     * 상태 무관하게(F-28) 돌려준다. subject가 ALL/미지정이면 전과목. PICK인데 cardIds가 없으면 빈 결과.
     */
    @Transactional(readOnly = true)
    public List<FlashcardItem> getFlashcards(Long userId, String subject, int limit, String mode, List<Long> cardIds) {
        if (MODE_PICK.equals(mode)) {
            if (cardIds == null || cardIds.isEmpty()) {
                return List.of();
            }
            return cardRepository.findByUserIdAndIdInAndDeletedAtIsNullOrderByCreatedAtDesc(userId, cardIds)
                    .stream().limit(limit).map(FlashcardItem::from).toList();
        }
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
