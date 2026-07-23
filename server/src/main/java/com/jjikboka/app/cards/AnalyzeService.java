package com.jjikboka.app.cards;

import com.jjikboka.analysis.AnalyzeJobService;
import com.jjikboka.core.card.QuotaConsumeService;
import com.jjikboka.shared.event.AnalyzeEvents;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 캡처 분석 접수 조립 (API-6, app 파사드). ArchUnit이 core·analysis 상호참조를 막으므로
 * 두 도메인(quota 차감·job 생성)을 여기서 <b>한 트랜잭션</b>으로 묶어 원자성을 만든다(13 §2).
 *
 * <p>순서가 중요하다: quota 차감이 먼저(한도 초과면 429로 job 생성 이전에 차단), 그 다음 job 생성.
 * 접수가 커밋된 뒤 워커가 실제 분석을 이어가도록 {@code AnalyzeRequested}를 발행한다(AFTER_COMMIT 소비).
 */
@Service
class AnalyzeService {

    private final QuotaConsumeService quotaConsumeService;
    private final AnalyzeJobService analyzeJobService;
    private final ApplicationEventPublisher eventPublisher;

    AnalyzeService(QuotaConsumeService quotaConsumeService,
                   AnalyzeJobService analyzeJobService,
                   ApplicationEventPublisher eventPublisher) {
        this.quotaConsumeService = quotaConsumeService;
        this.analyzeJobService = analyzeJobService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    AnalyzeAcceptedResponse submit(Long userId, AnalyzeRequest request) {
        quotaConsumeService.consume(userId);
        Long jobId = analyzeJobService.create(userId);
        eventPublisher.publishEvent(new AnalyzeEvents.AnalyzeRequested(jobId, userId, request.type()));
        return AnalyzeAcceptedResponse.pending(jobId);
    }
}
