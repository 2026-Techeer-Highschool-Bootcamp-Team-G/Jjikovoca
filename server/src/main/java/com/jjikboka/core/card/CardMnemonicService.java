package com.jjikboka.core.card;

import com.jjikboka.shared.error.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 연상 이미지 대상 조회·키 저장 (API-6c, core.card 공개 진입점). 카드 소유·본문(word)은 여기 소유이므로
 * 대상 조회(getTarget)와 생성 결과(키) 저장(savePath)만 노출한다 — 실제 생성(Gemini)·저장(S3)은 app 파사드가 한다(13 §2).
 *
 * <p>느린 외부 호출(이미지 생성) 중 DB 트랜잭션을 쥐지 않도록, 조회·저장을 각각 짧은 트랜잭션으로 나눈다.
 */
@Service
public class CardMnemonicService {

    private final CardRepository cardRepository;

    CardMnemonicService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    /** 소유 검증 후 기존 키·프롬프트 재료를 돌려준다. 404 NOT_FOUND · 403 FORBIDDEN. */
    @Transactional(readOnly = true)
    public MnemonicTarget getTarget(Long userId, Long cardId) {
        Card card = owned(userId, cardId);
        return new MnemonicTarget(card.getMnemonicImagePath(), card.getWord(), card.getContextMeaning());
    }

    /** 생성된 이미지 키를 카드에 캐시한다(더티 체킹). 소유 검증 재확인. */
    @Transactional
    public void savePath(Long userId, Long cardId, String path) {
        owned(userId, cardId).assignMnemonicImage(path);
    }

    private Card owned(Long userId, Long cardId) {
        Card card = cardRepository.findByIdAndDeletedAtIsNull(cardId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "카드를 찾을 수 없습니다."));
        if (!card.getUserId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "FORBIDDEN", "접근 권한이 없습니다.");
        }
        return card;
    }
}
