package com.jjikboka.core.card;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
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

    /** recallProb 정렬을 위해 DB에서 끌어오는 후보 상한 — 세션 limit보다 넉넉히 두고 R로 재정렬한다(초과분은 DB 순서 기준 절단). */
    private static final int CANDIDATE_CAP = 200;

    /**
     * 플래시카드 큐(API-12). TODAY(기본)는 미졸업 WORD의 due를 <b>recallProb 오름차순</b>(가장 잊기 쉬운 카드 먼저)으로,
     * PICK은 직접 고른 카드(cardIds)를 상태 무관하게(F-28) 돌려준다. subject가 ALL/미지정이면 전과목. PICK인데 cardIds가 없으면 빈 결과.
     *
     * <p>recallProb(R)는 FSRS 카드만 값이 있어 DB로 정렬할 수 없다 — 후보를 넉넉히 끌어와(FlashcardItem으로 계산) R 오름차순으로
     * 재정렬하고(非FSRS null은 뒤로) limit만큼 자른다.
     */
    @Transactional(readOnly = true)
    public List<FlashcardItem> getFlashcards(Long userId, String subject, int limit, String mode, List<Long> cardIds) {
        LocalDateTime now = LocalDateTime.now();   // recallProb(R) 계산·due 판정에 같은 기준시각 사용
        if (MODE_PICK.equals(mode)) {
            if (cardIds == null || cardIds.isEmpty()) {
                return List.of();
            }
            return cardRepository.findByUserIdAndIdInAndDeletedAtIsNullOrderByCreatedAtDesc(userId, cardIds)
                    .stream().limit(limit).map(card -> FlashcardItem.from(card, now)).toList();
        }
        String subjectFilter = (subject == null || SUBJECT_ALL.equals(subject)) ? null : subject;
        int poolSize = Math.max(limit, CANDIDATE_CAP);
        return cardRepository.findFlashcardQueue(userId, subjectFilter, now, PageRequest.of(0, poolSize))
                .stream()
                .map(card -> FlashcardItem.from(card, now))
                .sorted(Comparator.comparing(FlashcardItem::recallProb, Comparator.nullsLast(Comparator.naturalOrder())))
                .limit(limit)
                .toList();
    }

    /** 오늘의 복습 큐(API-13) — next_review_at 도래한 미졸업 카드를 이른 순으로 limit만큼. */
    @Transactional(readOnly = true)
    public List<ReviewQueueItem> getReviewQueue(Long userId, int limit) {
        return cardRepository.findReviewQueue(userId, LocalDateTime.now(), PageRequest.of(0, limit))
                .stream().map(ReviewQueueItem::from).toList();
    }
}
