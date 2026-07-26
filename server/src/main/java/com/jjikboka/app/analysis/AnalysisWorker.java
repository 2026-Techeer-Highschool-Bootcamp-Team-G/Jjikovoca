package com.jjikboka.app.analysis;

import com.jjikboka.analysis.AnalysisContent;
import com.jjikboka.analysis.AnalyzeJobService;
import com.jjikboka.analysis.GeminiAnalysisCache;
import com.jjikboka.analysis.GeminiImage;
import com.jjikboka.app.image.ImageStorageService;
import com.jjikboka.core.card.CardCreateCommand;
import com.jjikboka.core.card.CardCreationService;
import com.jjikboka.core.card.QuotaConsumeService;
import com.jjikboka.core.stats.ExpService;
import com.jjikboka.shared.event.AnalyzeEvents;
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
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

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

    /** WORD 지문(문맥) 이미지 다운스케일 상한(px). 지문은 정밀할 필요가 없고 크롭마다 반복 전송되므로 줄여 지연·비용을 낮춘다. */
    private static final int PASSAGE_MAX_DIM = 640;

    private final GeminiAnalysisCache geminiAnalysisCache;
    private final AnalyzeJobService analyzeJobService;
    private final CardCreationService cardCreationService;
    private final QuotaConsumeService quotaConsumeService;
    private final ImageStorageService imageStorageService;
    private final ApplicationEventPublisher eventPublisher;
    private final ExpService expService;
    private final Executor geminiCallExecutor;   // WORD 크롭별 Gemini 호출 병렬화 전용 풀(상한 4)

    AnalysisWorker(GeminiAnalysisCache geminiAnalysisCache,
                   AnalyzeJobService analyzeJobService,
                   CardCreationService cardCreationService,
                   QuotaConsumeService quotaConsumeService,
                   ImageStorageService imageStorageService,
                   ApplicationEventPublisher eventPublisher,
                   ExpService expService,
                   @Qualifier("geminiCallExecutor") Executor geminiCallExecutor) {
        this.geminiAnalysisCache = geminiAnalysisCache;
        this.analyzeJobService = analyzeJobService;
        this.cardCreationService = cardCreationService;
        this.quotaConsumeService = quotaConsumeService;
        this.imageStorageService = imageStorageService;
        this.eventPublisher = eventPublisher;
        this.expService = expService;
        this.geminiCallExecutor = geminiCallExecutor;
    }

    @Async("analysisExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void onAnalyzeRequested(AnalyzeEvents.AnalyzeRequested event) {
        Long jobId = event.jobId();
        try {
            analyzeJobService.markRunning(jobId);
            emitStages(jobId, event.type());
            // WORD로 여러 단어를 칠하면 크롭마다 카드 하나 — 정보 누락 없이 단어별로 분석한다.
            // PROBLEM(수학)이나 크롭 0~1개 WORD는 기존 단일 호출 경로.
            String model = isMultiWord(event) ? analyzeWordsPerCrop(event) : analyzeSingle(event);
            analyzeJobService.markDone(jobId);
            eventPublisher.publishEvent(new AnalyzeEvents.AnalyzeCompleted(jobId, model));
            awardCaptureQuietly(event.userId());   // 오답 기록 보상(best-effort) — 실패해도 분석은 완료 유지
        } catch (Exception e) {
            log.error("분석 처리 실패 — jobId={}, quota 환불", jobId, e);
            analyzeJobService.markFailed(jobId);
            quotaConsumeService.refund(event.userId());
            eventPublisher.publishEvent(new AnalyzeEvents.AnalyzeFailed(jobId, e.getMessage()));
        }
    }

    /** WORD + 크롭 2개 이상이면 크롭별 카드 생성 경로로 간다(단어 하나 = 카드 하나). */
    private boolean isMultiWord(AnalyzeEvents.AnalyzeRequested event) {
        return "WORD".equals(event.type())
                && event.cropImageRefs() != null && event.cropImageRefs().size() >= 2;
    }

    /** 기존 단일 호출 경로(PROBLEM, 또는 크롭 0~1개 WORD) — 카드 1개 생성 후 model 반환. */
    private String analyzeSingle(AnalyzeEvents.AnalyzeRequested event) {
        List<GeminiImage> images = loadImages(event);
        // WORD 단일 크롭도 단어키 캐시를 쓴다. PROBLEM은 힌트 없음 → 이미지 해시 경로.
        String wordHint = "WORD".equals(event.type()) ? wordAt(event, 0) : null;
        AnalysisContent content = analyze(event.type(), wordHint, images);
        String imagePath = (event.cropImageRefs() == null || event.cropImageRefs().isEmpty())
                ? null : event.cropImageRefs().get(0);
        cardCreationService.create(toCommand(event, content, imagePath));
        return content.model();
    }

    /**
     * WORD 크롭별 순차 분석 — 크롭(단어)마다 [크롭 + 지문]으로 generate를 호출해 카드 1개씩 만든다.
     * 한 크롭이 실패해도 나머지는 진행(격리) — 전부 실패했을 때만 예외로 job FAILED + 환불로 이어진다.
     * 카드 image_path는 각자의 크롭이라 보관함·서빙이 단어별 이미지를 쓴다.
     */
    private String analyzeWordsPerCrop(AnalyzeEvents.AnalyzeRequested event) {
        // 지문은 크롭별 호출마다 함께 전송되므로(N×) 다운스케일해 입력 토큰·지연을 낮춘다(실패 시 원본).
        GeminiImage full = event.fullImageRef() == null ? null
                : VisionImageScaler.downscale(loadOne(event.fullImageRef()), PASSAGE_MAX_DIM);

        // 크롭(단어)마다 Gemini 호출을 전용 풀에 동시에 던진다(팬아웃) — 지연이 N배 대신 ≈1콜.
        // 동시성은 geminiCallExecutor의 상한(4)이 제어한다(429 방어). 크롭별 OCR 힌트(wordAt)를 함께 넘긴다.
        List<String> refs = event.cropImageRefs();
        List<CompletableFuture<String>> futures = new ArrayList<>();
        for (int i = 0; i < refs.size(); i++) {
            String cropRef = refs.get(i);
            String wordHint = wordAt(event, i);
            futures.add(CompletableFuture.supplyAsync(
                    () -> analyzeOneCrop(event, cropRef, full, wordHint), geminiCallExecutor));
        }

        // 전부 join 후 성공(model != null)만 수집. 실패는 analyzeOneCrop에서 흡수(null)돼 격리된다.
        List<String> models = futures.stream()
                .map(CompletableFuture::join)
                .filter(Objects::nonNull)
                .toList();

        if (models.isEmpty()) {   // 카드 0개 = 전부 실패 → 상위 catch로 FAILED·환불
            throw new IllegalStateException("모든 단어 크롭 분석 실패(" + event.cropImageRefs().size() + "개)");
        }
        return models.get(models.size() - 1);   // 대표 model(동일 클라이언트라 값 동일)
    }

    /**
     * 크롭 하나 분석 + 카드 생성. 예외는 여기서 흡수(로그 후 null)해 <b>단어별 실패를 격리</b>한다 —
     * 하나가 실패해도 다른 크롭의 future는 영향받지 않는다. {@code cardCreationService.create}는 @Transactional이라
     * 각 스레드가 독립 트랜잭션으로 INSERT(병렬 안전). 성공 시 content.model 반환, 실패 시 null.
     */
    private String analyzeOneCrop(AnalyzeEvents.AnalyzeRequested event, String cropRef, GeminiImage full, String wordHint) {
        try {
            List<GeminiImage> images = new ArrayList<>();
            GeminiImage crop = loadOne(cropRef);
            if (crop != null) {
                images.add(crop);
            }
            if (full != null) {
                images.add(full);   // 지문은 문맥(contextMeaning)용으로 매 호출에 함께 넣는다
            }
            AnalysisContent content = analyze("WORD", wordHint, images);
            cardCreationService.create(toCommand(event, content, cropRef));
            return content.model();
        } catch (RuntimeException e) {
            log.warn("단어 크롭 분석 실패(건너뜀) — jobId={}, crop={}: {}", event.jobId(), cropRef, e.getMessage());
            return null;
        }
    }

    /** 단어 힌트가 신뢰 가능하면 단어키 캐시(다른 사진의 같은 단어 재사용), 아니면 이미지 해시 캐시로 분석한다. */
    private AnalysisContent analyze(String type, String wordHint, List<GeminiImage> images) {
        String word = GeminiAnalysisCache.normalizeWord(wordHint);
        return word != null
                ? geminiAnalysisCache.generateByWord(word, images)
                : geminiAnalysisCache.generate(type, GeminiAnalysisCache.hash(images), images);
    }

    /** cropImageRefs와 인덱스 정렬된 OCR 힌트에서 i번째 단어를 꺼낸다(없으면 null). */
    private static String wordAt(AnalyzeEvents.AnalyzeRequested event, int i) {
        List<String> words = event.words();
        return (words != null && i < words.size()) ? words.get(i) : null;
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

    /** analysis 산출을 core.card 생성 커맨드로 옮긴다. image_path는 호출자가 넘긴 크롭(단어별) — 보관함·서빙이 이를 쓴다. */
    private CardCreateCommand toCommand(AnalyzeEvents.AnalyzeRequested event, AnalysisContent content, String imagePath) {
        return new CardCreateCommand(
                event.userId(), event.jobId(), event.type(), content.subject(), imagePath,
                content.word(), content.contextMeaning(), content.dictMeaning(), content.example(), content.exampleMeaning(),
                content.pronunciation(), content.pos(), content.tags(), content.emoji(),
                content.summary(), content.latex(), content.concept(),
                content.hint1(), content.hint2(), content.hint3(), content.answerFormat(),
                content.solutionsJson(), content.answerValue(), content.diagnosisJson());
    }
}
