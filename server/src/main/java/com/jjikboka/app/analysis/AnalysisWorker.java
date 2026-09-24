package com.jjikboka.app.analysis;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jjikboka.analysis.AnalysisContent;
import com.jjikboka.analysis.AnalyzeJobClaim;
import com.jjikboka.analysis.AnalyzeJobService;
import com.jjikboka.analysis.GeminiAnalysisCache;
import com.jjikboka.analysis.GeminiImage;
import com.jjikboka.app.image.ImageStorageService;
import com.jjikboka.core.card.CardCreateCommand;
import com.jjikboka.core.card.CardCreationService;
import com.jjikboka.core.card.QuotaService;
import com.jjikboka.stats.ExpService;
import com.jjikboka.common.event.AnalyzeEvents;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

/**
 * 캡처 분석 워커 (API-6 처리, app 파사드). ArchUnit이 analysis↔core 직접참조를 막으므로 두 슬라이스를 여기서 조립한다.
 *
 * <p><b>내구 처리(P1-6)</b>: 정상 흐름은 접수 커밋 후(AFTER_COMMIT) @Async가 즉시 {@link #processClaimable}로 처리하고,
 * 크래시·이벤트 유실로 멈춘 job은 watchdog가 같은 진입점으로 재수거한다. 두 경로 모두 claim 관문을 지나므로 정확히 1회만 처리된다.
 * 재구성 payload는 이벤트가 아니라 <b>job(payload_json)</b>에서 로드한다 — 이벤트가 없어도 job만으로 재분석이 가능하다.
 *
 * <p>흐름: claim → payload 복원 → 모의 Gemini 생성 → 카드 INSERT(멱등) → DONE + AnalyzeCompleted.
 * 실패는 attempts가 상한 미만이면 사유만 남기고(재수거 대기), 상한에 이르면 FAILED + <b>quota 환불</b>(사가 보상, 13 §6)한다.
 */
@Component
class AnalysisWorker {

    private static final Logger log = LoggerFactory.getLogger(AnalysisWorker.class);

    /** WORD 지문(문맥) 이미지 다운스케일 상한(px). 지문은 정밀할 필요가 없고 크롭마다 반복 전송되므로 줄여 지연·비용을 낮춘다. */
    private static final int PASSAGE_MAX_DIM = 640;

    private final GeminiAnalysisCache geminiAnalysisCache;
    private final AnalyzeJobService analyzeJobService;
    private final CardCreationService cardCreationService;
    private final QuotaService quotaConsumeService;
    private final ImageStorageService imageStorageService;
    private final ApplicationEventPublisher eventPublisher;
    private final ExpService expService;
    private final ObjectMapper objectMapper;
    private final Executor geminiCallExecutor;   // WORD 크롭별 Gemini 호출 병렬화 전용 풀(상한 4)

    AnalysisWorker(GeminiAnalysisCache geminiAnalysisCache,
                   AnalyzeJobService analyzeJobService,
                   CardCreationService cardCreationService,
                   QuotaService quotaConsumeService,
                   ImageStorageService imageStorageService,
                   ApplicationEventPublisher eventPublisher,
                   ExpService expService,
                   ObjectMapper objectMapper,
                   @Qualifier("geminiCallExecutor") Executor geminiCallExecutor) {
        this.geminiAnalysisCache = geminiAnalysisCache;
        this.analyzeJobService = analyzeJobService;
        this.cardCreationService = cardCreationService;
        this.quotaConsumeService = quotaConsumeService;
        this.imageStorageService = imageStorageService;
        this.eventPublisher = eventPublisher;
        this.expService = expService;
        this.objectMapper = objectMapper;
        this.geminiCallExecutor = geminiCallExecutor;
    }

    /**
     * 빠른 경로 — 접수 트랜잭션 커밋 후(AFTER_COMMIT) 전용 풀에서 즉시 처리 시도한다. job은 이미 보이고 202는 이미 나갔다.
     * 실제 소유·재구성은 {@link #processClaimable}가 claim·payload로 판정하므로, 이벤트는 처리를 앞당기는 트리거일 뿐이다.
     */
    @Async("analysisExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void onAnalyzeRequested(AnalyzeEvents.AnalyzeRequested event) {
        processClaimable(event.jobId());
    }

    /**
     * 내구 처리 진입점(@Async·watchdog 공용). claim으로 소유권을 잡은 뒤에만 처리한다 — 경합에 지면(다른 경로가 이미 처리 중)
     * 조용히 반환한다. attempts가 상한을 넘긴 claim은 처리하지 않고 FAILED 확정 + 환불한다.
     * 처리 실패는 상한 미만이면 사유만 남겨 재수거를 기다리고, 상한에 이르면 즉시 FAILED + 환불한다(무한 재시도 방지).
     */
    void processClaimable(Long jobId) {
        Optional<AnalyzeJobClaim> claimed = analyzeJobService.claim(jobId);
        if (claimed.isEmpty()) {
            return;   // 경합 패배(이미 처리 중) 또는 종결 상태 — 재수거 대상 아님
        }
        AnalyzeJobClaim claim = claimed.get();

        // 이번 claim이 이미 상한을 넘겼다면 처리하지 않고 최종 실패 확정 + 환불.
        if (analyzeJobService.isExhausted(claim.attempts())) {
            failAndRefund(claim, "재시도 상한 초과(attempts=" + claim.attempts() + ")");
            return;
        }

        AnalyzePayload payload = readPayload(claim);
        if (payload == null) {   // payload가 없거나 깨졌으면 재구성 불가 — 재시도해도 소용없어 즉시 최종 실패.
            failAndRefund(claim, "payload 복원 실패(재구성 불가)");
            return;
        }

        try {
            emitStages(jobId);
            String model = isMultiWord(payload) ? analyzeWordsPerCrop(claim, payload) : analyzeSingle(claim, payload);
            analyzeJobService.markDone(jobId);
            eventPublisher.publishEvent(new AnalyzeEvents.AnalyzeCompleted(jobId, model));
            awardCaptureQuietly(claim.userId());   // 오답 기록 보상(best-effort) — 실패해도 분석은 완료 유지
        } catch (Exception e) {
            // 상한에 이른 마지막 시도면 즉시 최종 실패 + 환불, 아니면 사유만 남기고 watchdog 재수거를 기다린다.
            if (analyzeJobService.isLastAttempt(claim.attempts())) {
                log.error("분석 처리 실패(상한 도달) — jobId={}, quota 환불", jobId, e);
                failAndRefund(claim, e.getMessage());
            } else {
                log.warn("분석 처리 실패(재수거 대기) — jobId={}, attempts={}: {}", jobId, claim.attempts(), e.getMessage());
                analyzeJobService.recordError(jobId, e.getMessage());
            }
        }
    }

    /** 최종 실패 확정 — FAILED + 사유 기록 후 quota 환불(멱등) + AnalyzeFailed 알림. */
    private void failAndRefund(AnalyzeJobClaim claim, String reason) {
        analyzeJobService.markFailedExhausted(claim.jobId(), reason);
        quotaConsumeService.refund(claim.userId());
        eventPublisher.publishEvent(new AnalyzeEvents.AnalyzeFailed(claim.jobId(), reason));
    }

    /** job에 저장된 payload_json을 복원한다 — 없거나 역직렬화 실패면 null(호출자가 최종 실패로 처리). */
    private AnalyzePayload readPayload(AnalyzeJobClaim claim) {
        if (claim.payloadJson() == null || claim.payloadJson().isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(claim.payloadJson(), AnalyzePayload.class);
        } catch (Exception e) {
            log.error("payload 역직렬화 실패 — jobId={}: {}", claim.jobId(), e.getMessage());
            return null;
        }
    }

    /** WORD + 크롭 2개 이상이면 크롭별 카드 생성 경로로 간다(단어 하나 = 카드 하나). */
    private boolean isMultiWord(AnalyzePayload payload) {
        return "WORD".equals(payload.type())
                && payload.cropImageRefs() != null && payload.cropImageRefs().size() >= 2;
    }

    /** 기존 단일 호출 경로(PROBLEM, 또는 크롭 0~1개 WORD) — 카드 1개 생성 후 model 반환. */
    private String analyzeSingle(AnalyzeJobClaim claim, AnalyzePayload payload) {
        List<GeminiImage> images = loadImages(payload);
        AnalysisContent content = analyze(payload.type(), images);
        String imagePath = (payload.cropImageRefs() == null || payload.cropImageRefs().isEmpty())
                ? null : payload.cropImageRefs().get(0);
        cardCreationService.create(toCommand(claim, payload, content, imagePath));   // 멱등: 이미 있으면 skip
        return content.model();
    }

    /**
     * WORD 크롭별 분석 — 크롭(단어)마다 [크롭 + 지문]으로 generate를 호출해 카드 1개씩 만든다.
     * 한 크롭이 실패해도 나머지는 진행(격리) — 전부 실패했을 때만 예외로 상위 재시도/최종 실패로 이어진다.
     * 카드 image_path는 각자의 크롭이라 보관함·서빙이 단어별 이미지를 쓴다.
     */
    private String analyzeWordsPerCrop(AnalyzeJobClaim claim, AnalyzePayload payload) {
        // 지문은 크롭별 호출마다 함께 전송되므로(N×) 다운스케일해 입력 토큰·지연을 낮춘다(실패 시 원본).
        GeminiImage full = payload.fullImageRef() == null ? null
                : VisionImageScaler.downscale(loadOne(payload.fullImageRef()), PASSAGE_MAX_DIM);

        // 크롭(단어)마다 Gemini 호출을 전용 풀에 동시에 던진다(팬아웃) — 지연이 N배 대신 ≈1콜.
        // 동시성은 geminiCallExecutor의 상한(4)이 제어한다(429 방어). 각 크롭 이미지가 분석의 진실 소스다.
        List<String> refs = payload.cropImageRefs();
        List<CompletableFuture<String>> futures = new ArrayList<>();
        for (String cropRef : refs) {
            futures.add(CompletableFuture.supplyAsync(
                    () -> analyzeOneCrop(claim, cropRef, full), geminiCallExecutor));
        }

        // 전부 join 후 성공(model != null)만 수집. 실패는 analyzeOneCrop에서 흡수(null)돼 격리된다.
        List<String> models = futures.stream()
                .map(CompletableFuture::join)
                .filter(Objects::nonNull)
                .toList();

        if (models.isEmpty()) {   // 카드 0개 = 전부 실패 → 상위에서 재시도/최종 실패
            throw new IllegalStateException("모든 단어 크롭 분석 실패(" + payload.cropImageRefs().size() + "개)");
        }
        return models.get(models.size() - 1);   // 대표 model(동일 클라이언트라 값 동일)
    }

    /**
     * 크롭 하나 분석 + 카드 생성. 예외는 여기서 흡수(로그 후 null)해 <b>단어별 실패를 격리</b>한다 —
     * 하나가 실패해도 다른 크롭의 future는 영향받지 않는다. {@code cardCreationService.create}는 @Transactional이라
     * 각 스레드가 독립 트랜잭션으로 INSERT(병렬 안전)하고 (job, crop) 멱등 가드로 재처리 중복을 막는다. 성공 시 content.model 반환.
     */
    private String analyzeOneCrop(AnalyzeJobClaim claim, String cropRef, GeminiImage full) {
        try {
            List<GeminiImage> images = new ArrayList<>();
            GeminiImage crop = loadOne(cropRef);
            if (crop != null) {
                images.add(crop);
            }
            if (full != null) {
                images.add(full);   // 지문은 문맥(contextMeaning)용으로 매 호출에 함께 넣는다
            }
            AnalysisContent content = analyze("WORD", images);
            cardCreationService.create(toCommandForWord(claim, content, cropRef));   // 멱등: (job, crop) 있으면 skip
            return content.model();
        } catch (RuntimeException e) {
            log.warn("단어 크롭 분석 실패(건너뜀) — jobId={}, crop={}: {}", claim.jobId(), cropRef, e.getMessage());
            return null;
        }
    }

    /**
     * 이미지 내용 해시 캐시로 분석한다 — <b>이미지가 유일한 진실 소스</b>. OCR 힌트를 캐시 키로 쓰던 경로는
     * 오독·교차충돌로 엉뚱한 카드를 냈어(#371) 제거했다. 같은 크롭+지문이면만 캐시 히트라 카드가 항상 이미지와 일치한다.
     */
    private AnalysisContent analyze(String type, List<GeminiImage> images) {
        return geminiAnalysisCache.generate(type, GeminiAnalysisCache.hash(images), images);
    }

    /** 참조 하나를 비전 입력으로 로드한다(읽기 실패면 null — 모의/부분 흐름 허용). */
    private GeminiImage loadOne(String ref) {
        return imageStorageService.readBytes(ref)
                .map(bytes -> new GeminiImage(ImageStorageService.mimeOf(ref), bytes))
                .orElse(null);
    }

    /** 캡처 exp 적립(F3) — 카드는 이미 저장·완료됐으므로 적립 실패가 분석을 되돌리지 않게 별도 try로 격리(로그만). */
    private void awardCaptureQuietly(Long userId) {
        try {
            expService.awardCapture(userId);
        } catch (RuntimeException e) {
            log.warn("캡처 exp 적립 실패(무시) — userId={}: {}", userId, e.getMessage());
        }
    }

    /**
     * 진행 단계를 SSE(API-40)용으로 발행한다. 영어 단어 분석은 문맥 분석 단계만 있다.
     * mock은 즉시 끝나 단계가 순식간에 지나갈 수 있다 — 구독이 늦으면 폴링/즉시 done으로 메운다.
     */
    private void emitStages(Long jobId) {
        eventPublisher.publishEvent(new AnalyzeEvents.AnalyzeProgressed(jobId, "analyzing"));
    }

    /**
     * 접수 때 저장한 크롭·지문을 로드해 비전 입력으로 만든다(크롭 먼저, 지문 뒤). 읽기 실패한 참조는 건너뛴다 —
     * 이미지 없이도(모의) 흐름은 이어진다. mime은 파일명 확장자로 되돌린다.
     */
    private List<GeminiImage> loadImages(AnalyzePayload payload) {
        List<String> refs = new ArrayList<>();
        if (payload.cropImageRefs() != null) {
            refs.addAll(payload.cropImageRefs());
        }
        if (payload.fullImageRef() != null) {
            refs.add(payload.fullImageRef());
        }
        List<GeminiImage> images = new ArrayList<>();
        for (String ref : refs) {
            imageStorageService.readBytes(ref)
                    .ifPresent(bytes -> images.add(new GeminiImage(ImageStorageService.mimeOf(ref), bytes)));
        }
        return images;
    }

    /** analysis 산출을 core.card 생성 커맨드로 옮긴다(단일 카드). image_path는 대표 크롭(없으면 null). */
    private CardCreateCommand toCommand(AnalyzeJobClaim claim, AnalyzePayload payload, AnalysisContent content, String imagePath) {
        return buildCommand(claim, payload.type(), content, imagePath);
    }

    /** WORD 크롭별 카드 커맨드 — image_path는 각 크롭(단어별 이미지). */
    private CardCreateCommand toCommandForWord(AnalyzeJobClaim claim, AnalysisContent content, String imagePath) {
        return buildCommand(claim, "WORD", content, imagePath);
    }

    private CardCreateCommand buildCommand(AnalyzeJobClaim claim, String type, AnalysisContent content, String imagePath) {
        return new CardCreateCommand(
                claim.userId(), claim.jobId(), type, content.subject(), imagePath,
                content.word(), content.contextMeaning(), content.dictMeaning(), content.example(), content.exampleMeaning(),
                content.pronunciation(), content.pos(), content.tags(), content.emoji(), content.concept());
    }
}
