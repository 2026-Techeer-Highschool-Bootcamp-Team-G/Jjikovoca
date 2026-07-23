package com.jjikboka.core.card;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 카드 생성 (core.card 공개 진입점, API-6 처리). 분석 워커(app)가 커맨드를 넘기면 새 오답 카드를 INSERT한다.
 * card 엔티티는 패키지 비공개 — 밖으로는 생성된 cardId(Long)만 넘긴다(13 §2).
 */
@Service
public class CardCreationService {

    private final CardRepository cardRepository;

    CardCreationService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    @Transactional
    public Long create(CardCreateCommand command) {
        return cardRepository.save(Card.fromAnalysis(command)).getId();
    }
}
