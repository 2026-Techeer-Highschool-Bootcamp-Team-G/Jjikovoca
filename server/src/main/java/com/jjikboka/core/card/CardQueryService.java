package com.jjikboka.core.card;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 카드 조회 (core.card 공개 진입점, API-7). 피드는 최신순·soft-delete 제외가 기본이고,
 * subject가 ALL(또는 미지정)이면 전체, 아니면 과목별로 좁힌다. 노출은 {@link CardSummary}로만(정답 미노출, 13 §7).
 */
@Service
public class CardQueryService {

    private static final String SUBJECT_ALL = "ALL";

    private final CardRepository cardRepository;

    CardQueryService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    @Transactional(readOnly = true)
    public List<CardSummary> getFeed(Long userId, String subject) {
        List<Card> cards = (subject == null || SUBJECT_ALL.equals(subject))
                ? cardRepository.findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(userId)
                : cardRepository.findByUserIdAndSubjectAndDeletedAtIsNullOrderByCreatedAtDesc(userId, subject);
        return cards.stream().map(CardSummary::from).toList();
    }
}
