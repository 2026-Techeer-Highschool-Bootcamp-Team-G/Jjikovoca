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
 * <p><b>렌더 분리</b>: 실제 파일 생성은 {@link ExportRenderer}가 맡는다(텍스트 스텁 / headless Chromium PDF·PNG, 토글).
 * 파사드는 조립·원자성만 책임지고, 렌더 산출(바이트+확장자)을 저장한다 — 생성→다운로드 계약(downloadUrl·expiresIn)은 불변.
 */
@Service
public class ExportFacade {

    private static final int EXPIRES_IN = 3600;

    private final PremiumQueryService premiumQueryService;
    private final QuotaConsumeService quotaConsumeService;
    private final CardQueryService cardQueryService;
    private final ExportLogService exportLogService;
    private final ExportRenderer exportRenderer;
    private final ExportStorage exportStorage;

    ExportFacade(PremiumQueryService premiumQueryService,
                 QuotaConsumeService quotaConsumeService,
                 CardQueryService cardQueryService,
                 ExportLogService exportLogService,
                 ExportRenderer exportRenderer,
                 ExportStorage exportStorage) {
        this.premiumQueryService = premiumQueryService;
        this.quotaConsumeService = quotaConsumeService;
        this.cardQueryService = cardQueryService;
        this.exportLogService = exportLogService;
        this.exportRenderer = exportRenderer;
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
        ExportRenderer.Rendered rendered = exportRenderer.render(request.type(), cards);
        exportStorage.write(exportId, rendered.content(), rendered.extension());

        return new ExportCreateResponse("/api/export/" + exportId + "/download", EXPIRES_IN);
    }
}
