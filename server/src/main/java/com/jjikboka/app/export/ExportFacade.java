package com.jjikboka.app.export;

import com.jjikboka.core.card.CardQueryService;
import com.jjikboka.core.card.CardSummary;
import com.jjikboka.core.card.PremiumQueryService;
import com.jjikboka.core.card.QuotaConsumeService;
import com.jjikboka.core.export.ExportLogService;
import com.jjikboka.shared.error.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 내보내기 생성 조립 (API-25, app 파사드, 프리미엄 전용). 프리미엄·한도(core.card)와 대상 카드(core.card),
 * 기록(core.export), 파일 저장(app)을 한 트랜잭션으로 엮는다. quota 차감이 트랜잭션 내라 파일 저장 실패 시 함께 롤백.
 *
 * <p><b>MVP 렌더</b>: 카드 요약을 텍스트로 스텁 생성한다(정답 미노출, 13 §7). 실 렌더(AI 편집 + headless Chromium PDF/JPG)는
 * 인프라 확정 후 이 render/ExportStorage만 교체하며, 생성→다운로드 계약(downloadUrl·expiresIn)은 불변이다.
 */
@Service
public class ExportFacade {

    private static final int EXPIRES_IN = 3600;

    private final PremiumQueryService premiumQueryService;
    private final QuotaConsumeService quotaConsumeService;
    private final CardQueryService cardQueryService;
    private final ExportLogService exportLogService;
    private final ExportStorage exportStorage;

    ExportFacade(PremiumQueryService premiumQueryService,
                 QuotaConsumeService quotaConsumeService,
                 CardQueryService cardQueryService,
                 ExportLogService exportLogService,
                 ExportStorage exportStorage) {
        this.premiumQueryService = premiumQueryService;
        this.quotaConsumeService = quotaConsumeService;
        this.cardQueryService = cardQueryService;
        this.exportLogService = exportLogService;
        this.exportStorage = exportStorage;
    }

    @Transactional
    public ExportCreateResponse create(Long userId, ExportRequest request) {
        if (!premiumQueryService.isPremium(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "PREMIUM_REQUIRED", "프리미엄 전용 기능입니다.");
        }
        quotaConsumeService.consume(userId);   // 429 QUOTA_EXCEEDED

        List<CardSummary> cards = cardQueryService.getSummaries(userId, request.cardIds());
        Long exportId = exportLogService.record(userId, request.type(), cards.size());
        exportStorage.write(exportId, render(request.type(), cards));

        return new ExportCreateResponse("/api/export/" + exportId + "/download", EXPIRES_IN);
    }

    /** 카드 요약을 텍스트로 렌더(스텁). WORD는 단어·문맥 뜻, PROBLEM은 개념·요약 — 정답은 싣지 않는다. */
    private String render(String type, List<CardSummary> cards) {
        StringBuilder body = new StringBuilder("찍어보카 내보내기 (").append(type).append(")\n\n");
        int index = 1;
        for (CardSummary card : cards) {
            body.append(index++).append(". ");
            if ("WORD".equals(card.type())) {
                body.append(nullToDash(card.word())).append(" — ").append(nullToDash(card.contextMeaning()));
            } else {
                body.append(nullToDash(card.concept())).append(" — ").append(nullToDash(card.summary()));
            }
            body.append('\n');
        }
        return body.toString();
    }

    private String nullToDash(String value) {
        return value == null ? "-" : value;
    }
}
