package com.jjikboka.core.card;

import com.jjikboka.shared.error.BusinessException;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 수학 학습 (core.card 공개 진입점, API-29·30·31). 복습 큐는 골격만 노출하고(masked·answerValue 미포함),
 * 단계 공개(30)는 특정 단계 content를, 정답 판정(31)은 서버 채점 후 정답·해설을 드러낸다 — 비노출 계약(13 §7).
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

    /**
     * 사고 단계 공개(API-30). 소유자 카드의 solutionIndex 풀이에서 no번 단계 content를 드러낸다.
     * 없는 카드/풀이/단계는 404, 남의 카드는 403(NFR-04). content는 이 시점에만 노출(masked 해제).
     */
    @Transactional(readOnly = true)
    public MathStepReveal revealStep(Long userId, Long cardId, int no, int solutionIndex) {
        Card card = loadOwned(userId, cardId);
        MathStep step = mathJsonSupport.parseSolutions(card.getSolutions()).stream()
                .filter(solution -> solution.index() == solutionIndex)
                .flatMap(solution -> solution.steps() == null ? java.util.stream.Stream.<MathStep>empty() : solution.steps().stream())
                .filter(s -> s.no() == no)
                .findFirst()
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "카드를 찾을 수 없습니다."));
        return new MathStepReveal(solutionIndex, no, step.content());
    }

    /**
     * 정답 판정(API-31). 서버가 answer_format으로 채점하고, 판정 후에만 정답·해설을 공개한다.
     * <b>판정만</b> — 이력·전이는 API-11 MATH_REVIEW가 담당한다(판정/자기평가 분리). 없는 카드 404·타인 403.
     */
    @Transactional(readOnly = true)
    public MathJudgeResult judge(Long userId, Long cardId, String answer) {
        Card card = loadOwned(userId, cardId);
        boolean correct = MathJudge.judge(card.getAnswerFormat(), card.getAnswerValue(), answer);
        List<Solution> withExplanation = mathJsonSupport.parseSolutions(card.getSolutions()).stream()
                .map(s -> new Solution(s.index(), s.label(), null, s.explanation()))
                .toList();
        return new MathJudgeResult(correct, card.getAnswerValue(), withExplanation,
                mathJsonSupport.parseDiagnosis(card.getDiagnosis()));
    }

    private Card loadOwned(Long userId, Long cardId) {
        Card card = cardRepository.findByIdAndDeletedAtIsNull(cardId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "카드를 찾을 수 없습니다."));
        if (!card.getUserId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "FORBIDDEN", "접근 권한이 없습니다.");
        }
        return card;
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
