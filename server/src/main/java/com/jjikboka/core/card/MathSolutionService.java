package com.jjikboka.core.card;

import com.jjikboka.shared.error.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

/**
 * 다른 풀이 생성 (core.card 공개 진입점, API-41, 프리미엄 전용). 소유자 검증(404/403) → 프리미엄(403 PREMIUM_REQUIRED) →
 * 한도 차감(429) 후, 주입된 생성기로 새 풀이를 받아 card.solutions[]에 <b>append 후 저장</b>한다(재열람 시 재생성 없음).
 *
 * <p>AI 생성은 analysis 슬라이스라 {@code Function<수식,풀이JSON>}으로 주입받는다(의존 역전, 경계 유지, 13 §2).
 * 저장은 content 포함 full(단계 공개 30 열람용), 반환은 masked(단계 content·해설 제거). quota 차감이 트랜잭션 내라 실패 시 롤백.
 */
@Service
public class MathSolutionService {

    private final CardRepository cardRepository;
    private final PremiumQueryService premiumQueryService;
    private final QuotaConsumeService quotaConsumeService;
    private final MathJsonSupport mathJsonSupport;

    MathSolutionService(CardRepository cardRepository,
                        PremiumQueryService premiumQueryService,
                        QuotaConsumeService quotaConsumeService,
                        MathJsonSupport mathJsonSupport) {
        this.cardRepository = cardRepository;
        this.premiumQueryService = premiumQueryService;
        this.quotaConsumeService = quotaConsumeService;
        this.mathJsonSupport = mathJsonSupport;
    }

    @Transactional
    public Solution addSolution(Long userId, Long cardId, Function<String, String> solutionGenerator) {
        Card card = cardRepository.findByIdAndDeletedAtIsNull(cardId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "카드를 찾을 수 없습니다."));
        if (!card.getUserId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "FORBIDDEN", "접근 권한이 없습니다.");
        }
        if (!premiumQueryService.isPremium(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "PREMIUM_REQUIRED", "프리미엄 전용 기능입니다.");
        }
        quotaConsumeService.consume(userId);   // 429 QUOTA_EXCEEDED

        Solution generated = mathJsonSupport.parseSolution(solutionGenerator.apply(card.getLatex()));
        if (generated == null) {
            throw new BusinessException(HttpStatus.BAD_GATEWAY, "AI_FAILED", "AI 분석에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        }

        List<Solution> solutions = new ArrayList<>(mathJsonSupport.parseSolutions(card.getSolutions()));
        Solution added = new Solution(solutions.size(), generated.label(), generated.steps(), generated.explanation());
        solutions.add(added);
        card.updateSolutions(mathJsonSupport.writeSolutions(solutions));   // full content 저장

        return added.masked();   // 응답은 단계 content·해설 제거
    }
}
