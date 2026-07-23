package com.jjikboka.core.card;

import com.jjikboka.shared.error.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 카드 명령 (core.card 공개 진입점, API-9). 조회 전용 {@link CardQueryService}와 역할을 나눠 상태 변경만 맡는다.
 * 삭제는 soft delete — deleted_at만 찍고 행은 남겨 학습 이력·통계 근거를 보존한다(13 §7 정신).
 */
@Service
public class CardCommandService {

    private final CardRepository cardRepository;

    CardCommandService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    /**
     * 카드를 soft delete하고 삭제된 id를 돌려준다. 없거나 이미 삭제된 카드는 404, 남의 카드는 403으로 막는다(NFR-04).
     */
    @Transactional
    public Long delete(Long userId, Long cardId) {
        Card card = cardRepository.findByIdAndDeletedAtIsNull(cardId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "카드를 찾을 수 없습니다."));
        if (!card.getUserId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "FORBIDDEN", "접근 권한이 없습니다.");
        }
        card.softDelete(LocalDateTime.now());
        return card.getId();
    }
}
