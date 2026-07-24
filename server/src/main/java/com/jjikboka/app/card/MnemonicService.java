package com.jjikboka.app.card;

import com.jjikboka.analysis.GeminiClient;
import com.jjikboka.app.image.ImageStorageService;
import com.jjikboka.core.card.CardMnemonicService;
import com.jjikboka.core.card.MnemonicTarget;
import com.jjikboka.shared.error.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/**
 * 연상 이미지 온디맨드 조립 (API-6c, app 파사드). 캐시 확인(core.card) → 생성(analysis Gemini) → 저장(app.image S3) →
 * 키 캐시(core.card). 느린 외부 호출(생성)은 트랜잭션 밖에서 하고, 키 저장만 짧은 트랜잭션(core.card)에 맡긴다 —
 * 이미지 생성 수초 동안 DB 커넥션을 쥐지 않게 한다.
 */
@Service
public class MnemonicService {

    private final CardMnemonicService cardMnemonicService;
    private final GeminiClient geminiClient;
    private final ImageStorageService imageStorageService;

    MnemonicService(CardMnemonicService cardMnemonicService, GeminiClient geminiClient,
                    ImageStorageService imageStorageService) {
        this.cardMnemonicService = cardMnemonicService;
        this.geminiClient = geminiClient;
        this.imageStorageService = imageStorageService;
    }

    /** 온디맨드 — 이미 있으면 캐시된 키를 그대로, 없으면 생성·저장 후 키를 돌려준다. */
    public String generateOrGet(Long userId, Long cardId) {
        MnemonicTarget target = cardMnemonicService.getTarget(userId, cardId);   // 소유 검증 + 기존 키
        if (target.existingPath() != null) {
            return target.existingPath();                                        // 캐시 히트 — 재생성 안 함(비용 절감)
        }
        String dataUrl;
        try {
            dataUrl = geminiClient.generateMnemonicImage(target.word(), target.contextMeaning());
        } catch (RuntimeException e) {
            // 이미지 모델 실패(쿼터·타임아웃 등)는 클라에 깔끔한 503으로 — 그대로 새면 빈 본문 403이 된다.
            throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "MNEMONIC_GENERATION_FAILED",
                    "연상 이미지 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        }
        String key = imageStorageService.save(dataUrl);
        cardMnemonicService.savePath(userId, cardId, key);
        return key;
    }
}
