package com.jjikboka.core.card;

import com.jjikboka.shared.error.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 카드 조회 (core.card 공개 진입점, API-7·8). 피드는 최신순·soft-delete 제외가 기본이고,
 * subject가 ALL(또는 미지정)이면 전체, 아니면 과목별로 좁힌다. 상세는 소유자 검증(403)·존재 검증(404)을 서버가 강제한다.
 * 노출은 {@link CardSummary}·{@link CardDetail}로만(정답 미노출, 13 §7).
 */
@Service
public class CardQueryService {

    private static final String SUBJECT_ALL = "ALL";

    private final CardRepository cardRepository;
    private final PremiumQueryService premiumQueryService;

    CardQueryService(CardRepository cardRepository, PremiumQueryService premiumQueryService) {
        this.cardRepository = cardRepository;
        this.premiumQueryService = premiumQueryService;
    }

    @Transactional(readOnly = true)
    public List<CardSummary> getFeed(Long userId, String subject) {
        List<Card> cards = (subject == null || SUBJECT_ALL.equals(subject))
                ? cardRepository.findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(userId)
                : cardRepository.findByUserIdAndSubjectAndDeletedAtIsNullOrderByCreatedAtDesc(userId, subject);
        return cards.stream().map(CardSummary::from).toList();
    }

    /**
     * 카드 상세. 없거나 삭제된 카드는 404, 남의 카드는 403으로 서버가 막는다(NFR-04).
     * 힌트 게이팅에 쓸 프리미엄 여부를 함께 판정해 {@link CardDetail}로 조립한다.
     */
    @Transactional(readOnly = true)
    public CardDetail getDetail(Long userId, Long cardId) {
        Card card = cardRepository.findByIdAndDeletedAtIsNull(cardId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "카드를 찾을 수 없습니다."));
        if (!card.getUserId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "FORBIDDEN", "접근 권한이 없습니다.");
        }
        return CardDetail.from(card, premiumQueryService.isPremium(userId));
    }
}
