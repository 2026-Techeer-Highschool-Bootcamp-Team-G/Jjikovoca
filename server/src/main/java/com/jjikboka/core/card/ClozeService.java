package com.jjikboka.core.card;

import com.jjikboka.shared.error.BusinessException;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 빈칸 퀴즈 (core.card 공개 진입점, API-14·15). 저장 예문으로 문항을 만들고(정답 미노출), 제출 답을 서버가 판정해
 * 라이트너 전이까지 적용한다. word·example이 card 소유라 이 로직도 여기 둔다 — study_log는 app이 core.review로 엮는다.
 */
@Service
public class ClozeService {

    private final CardRepository cardRepository;

    ClozeService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    /** 문항 생성(API-14) — 예문 보유 미졸업 WORD 카드로 빈칸 문항을 만든다. 정답은 담지 않는다. */
    @Transactional(readOnly = true)
    public List<ClozeItem> getItems(Long userId, int limit) {
        return cardRepository.findClozeCandidates(userId, PageRequest.of(0, limit))
                .stream().map(ClozeItem::from).toList();
    }

    /**
     * 답 제출·판정(API-15). 없거나 삭제된 카드는 404, 남의 카드는 403(NFR-04). 정답이면 KNOW, 오답이면 DONT_KNOW로
     * 라이트너 전이하고, 채점 결과와 함께 정답 단어를 공개한다(제출 후 공개, 13 §7).
     */
    @Transactional
    public ClozeAnswerResult submit(Long userId, Long cardId, String guess) {
        Card card = cardRepository.findByIdAndDeletedAtIsNull(cardId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "카드를 찾을 수 없습니다."));
        if (!card.getUserId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "FORBIDDEN", "접근 권한이 없습니다.");
        }
        boolean correct = ClozeMaker.judge(card.getWord(), guess);
        card.applyLightner(correct ? "KNOW" : "DONT_KNOW", LocalDateTime.now());
        return new ClozeAnswerResult(correct, card.getWord(), CardReviewState.from(card));
    }
}
