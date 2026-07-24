package com.jjikboka.app.analysis;

import com.jjikboka.analysis.AnalysisContent;
import com.jjikboka.analysis.AnalyzeJobService;
import com.jjikboka.analysis.GeminiClient;
import com.jjikboka.analysis.GeminiImage;
import com.jjikboka.app.image.ImageStorageService;
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

import java.util.ArrayList;
import java.util.List;

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
    private final ImageStorageService imageStorageService;
    private final ApplicationEventPublisher eventPublisher;

    AnalysisWorker(GeminiClient geminiClient,
                   AnalyzeJobService analyzeJobService,
                   CardCreationService cardCreationService,
                   QuotaConsumeService quotaConsumeService,
                   ImageStorageService imageStorageService,
                   ApplicationEventPublisher eventPublisher) {
        this.geminiClient = geminiClient;
        this.analyzeJobService = analyzeJobService;
        this.cardCreationService = cardCreationService;
        this.quotaConsumeService = quotaConsumeService;
        this.imageStorageService = imageStorageService;
        this.eventPublisher = eventPublisher;
    }

    @Async("analysisExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void onAnalyzeRequested(AnalyzeEvents.AnalyzeRequested event) {
        Long jobId = event.jobId();
        try {
            analyzeJobService.markRunning(jobId);
            emitStages(jobId, event.type());
            List<GeminiImage> images = loadImages(event);
            AnalysisContent content = geminiClient.generate(event.type(), images);
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

    /**
     * 접수 때 저장한 크롭·지문을 로드해 비전 입력으로 만든다(크롭 먼저, 지문 뒤). 읽기 실패한 참조는 건너뛴다 —
     * 이미지 없이도(모의) 흐름은 이어진다. mime은 파일명 확장자로 되돌린다.
     */
    private List<GeminiImage> loadImages(AnalyzeEvents.AnalyzeRequested event) {
        List<String> refs = new ArrayList<>();
        if (event.cropImageRefs() != null) {
            refs.addAll(event.cropImageRefs());
        }
        if (event.fullImageRef() != null) {
            refs.add(event.fullImageRef());
        }
        List<GeminiImage> images = new ArrayList<>();
        for (String ref : refs) {
            imageStorageService.readBytes(ref)
                    .ifPresent(bytes -> images.add(new GeminiImage(ImageStorageService.mimeOf(ref), bytes)));
        }
        return images;
    }

    /** analysis 산출을 core.card 생성 커맨드로 옮긴다. image_path는 대표 크롭(첫 참조) — 보관함·서빙이 이를 쓴다. */
    private CardCreateCommand toCommand(AnalyzeEvents.AnalyzeRequested event, AnalysisContent content) {
        String imagePath = (event.cropImageRefs() == null || event.cropImageRefs().isEmpty())
                ? null : event.cropImageRefs().get(0);
        return new CardCreateCommand(
                event.userId(), event.jobId(), event.type(), content.subject(), imagePath,
                content.word(), content.contextMeaning(), content.dictMeaning(), content.example(),
                content.pronunciation(), content.pos(), content.tags(), content.emoji(),
                content.summary(), content.latex(), content.concept(),
                content.hint1(), content.hint2(), content.hint3(), content.answerFormat(),
                content.solutionsJson(), content.answerValue(), content.diagnosisJson());
    }
}
