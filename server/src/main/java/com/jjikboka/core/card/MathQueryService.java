package com.jjikboka.core.card;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 수학 복습 큐 조회 (core.card 공개 진입점, API-29). 복습 대상 PROBLEM 카드를 골격만 노출한다 —
 * 각 풀이 단계의 content와 해설(explanation)은 masked로 가리고 answerValue는 아예 싣지 않는다(13 §7).
 * 단계 content는 공개(30), 정답·해설은 판정(31)에서만 드러난다.
 */
@Service
public class MathQueryService {

    private final CardRepository cardRepository;
    private final MathJsonSupport mathJsonSupport;

    MathQueryService(CardRepository cardRepository, MathJsonSupport mathJsonSupport) {
        this.cardRepository = cardRepository;
        this.mathJsonSupport = mathJsonSupport;
    }

    @Transactional(readOnly = true)
    public List<MathCard> getQueue(Long userId, int limit) {
        return cardRepository.findMathQueue(userId, LocalDateTime.now(), PageRequest.of(0, limit))
                .stream().map(this::toMathCard).toList();
    }

    private MathCard toMathCard(Card card) {
        List<Solution> masked = mathJsonSupport.parseSolutions(card.getSolutions())
                .stream().map(Solution::masked).toList();
        return new MathCard(
                card.getId(),
                card.getLatex(),
                card.getImagePath(),
                masked,
                mathJsonSupport.parseDiagnosis(card.getDiagnosis()));
    }
}
