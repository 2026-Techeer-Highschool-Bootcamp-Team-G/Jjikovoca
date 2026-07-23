package com.jjikboka.app.analysis;

import com.jjikboka.analysis.AnalysisContent;
import com.jjikboka.analysis.AnalyzeJobService;
import com.jjikboka.analysis.GeminiClient;
import com.jjikboka.core.card.CardCreateCommand;
import com.jjikboka.core.card.CardCreationService;
import com.jjikboka.core.card.QuotaConsumeService;
import com.jjikboka.shared.event.AnalyzeEvents;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * 캡처 분석 워커 (API-6 처리, app 파사드). ArchUnit이 analysis↔core 직접참조를 막으므로 두 슬라이스를 여기서 조립한다.
 * 접수 트랜잭션이 커밋된 뒤(AFTER_COMMIT) 전용 풀에서 비동기로 돈다 — job은 이미 보이고, 접수 응답(202)은 이미 나갔다.
 *
 * <p>흐름: RUNNING → 모의 Gemini 생성 → 카드 INSERT → DONE + AnalyzeCompleted.
 * 어디서든 실패하면 FAILED로 표시하고 <b>quota를 환불</b>(사가 보상, 13 §6)한 뒤 AnalyzeFailed를 알린다.
 */
@Component
class AnalysisWorker {

    private static final Logger log = LoggerFactory.getLogger(AnalysisWorker.class);

    private final GeminiClient geminiClient;
    private final AnalyzeJobService analyzeJobService;
    private final CardCreationService cardCreationService;
    private final QuotaConsumeService quotaConsumeService;
    private final ApplicationEventPublisher eventPublisher;

    AnalysisWorker(GeminiClient geminiClient,
                   AnalyzeJobService analyzeJobService,
                   CardCreationService cardCreationService,
                   QuotaConsumeService quotaConsumeService,
                   ApplicationEventPublisher eventPublisher) {
        this.geminiClient = geminiClient;
        this.analyzeJobService = analyzeJobService;
        this.cardCreationService = cardCreationService;
        this.quotaConsumeService = quotaConsumeService;
        this.eventPublisher = eventPublisher;
    }

    @Async("analysisExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void onAnalyzeRequested(AnalyzeEvents.AnalyzeRequested event) {
        Long jobId = event.jobId();
        try {
            analyzeJobService.markRunning(jobId);
            emitStages(jobId, event.type());
            AnalysisContent content = geminiClient.generate(event.type());
            cardCreationService.create(toCommand(event, content));
            analyzeJobService.markDone(jobId);
            eventPublisher.publishEvent(new AnalyzeEvents.AnalyzeCompleted(jobId, content.model()));
        } catch (Exception e) {
            log.error("분석 처리 실패 — jobId={}, quota 환불", jobId, e);
            analyzeJobService.markFailed(jobId);
            quotaConsumeService.refund(event.userId());
            eventPublisher.publishEvent(new AnalyzeEvents.AnalyzeFailed(jobId, e.getMessage()));
        }
    }

    /**
     * 진행 단계를 SSE(API-40)용으로 발행한다. WORD는 문맥 분석만, PROBLEM은 힌트·사고단계·진단까지 이어진다.
     * mock은 즉시 끝나 단계가 순식간에 지나갈 수 있다 — 구독이 늦으면 폴링/즉시 done으로 메운다.
     */
    private void emitStages(Long jobId, String type) {
        eventPublisher.publishEvent(new AnalyzeEvents.AnalyzeProgressed(jobId, "analyzing"));
        if ("PROBLEM".equals(type)) {
            eventPublisher.publishEvent(new AnalyzeEvents.AnalyzeProgressed(jobId, "hintGenerating"));
            eventPublisher.publishEvent(new AnalyzeEvents.AnalyzeProgressed(jobId, "stepChaining"));
            eventPublisher.publishEvent(new AnalyzeEvents.AnalyzeProgressed(jobId, "diagnosing"));
        }
    }

    /** analysis 산출을 core.card 생성 커맨드로 옮긴다. 모의 단계라 imagePath는 null. */
    private CardCreateCommand toCommand(AnalyzeEvents.AnalyzeRequested event, AnalysisContent content) {
        return new CardCreateCommand(
                event.userId(), event.jobId(), event.type(), content.subject(), null,
                content.word(), content.contextMeaning(), content.dictMeaning(), content.example(),
                content.summary(), content.latex(), content.concept(),
                content.hint1(), content.hint2(), content.hint3(), content.answerFormat(),
                content.solutionsJson(), content.answerValue(), content.diagnosisJson());
    }
}
