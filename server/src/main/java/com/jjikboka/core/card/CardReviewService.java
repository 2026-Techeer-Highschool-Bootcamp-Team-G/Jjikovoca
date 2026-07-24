package com.jjikboka.core.card;

import com.jjikboka.shared.error.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 카드 복습 전이 (core.card 공개 진입점, API-11). 학습 결과를 받아 라이트너 전이를 적용하고 새 상태를 돌려준다.
 * box·next_review_at은 card 소유라 전이도 여기서 — study_log 원장은 core.review, app이 둘을 한 트랜잭션으로 엮는다.
 */
@Service
public class CardReviewService {

    private final CardRepository cardRepository;

    CardReviewService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    /**
     * 학습 결과(KNOW/CONFUSED/DONT_KNOW)로 카드를 전이한다. 없거나 삭제된 카드는 404, 남의 카드는 403(NFR-04).
     * 전이는 JPA 더티체킹으로 저장되고, 갱신된 복습 상태를 반환한다.
     */
    @Transactional
    public CardReviewState applyResult(Long userId, Long cardId, String result) {
        Card card = cardRepository.findByIdAndDeletedAtIsNull(cardId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "카드를 찾을 수 없습니다."));
        if (!card.getUserId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "FORBIDDEN", "접근 권한이 없습니다.");
        }
        card.review(result, LocalDateTime.now());
        return CardReviewState.from(card);
    }
}
