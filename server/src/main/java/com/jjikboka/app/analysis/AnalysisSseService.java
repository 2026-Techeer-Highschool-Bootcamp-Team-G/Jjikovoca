package com.jjikboka.app.analysis;

import com.jjikboka.analysis.AnalyzeJobService;
import com.jjikboka.analysis.AnalyzeJobView;
import com.jjikboka.core.card.CardQueryService;
import com.jjikboka.core.card.CardSummary;
import com.jjikboka.shared.event.AnalyzeEvents;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

/**
 * 분석 진행 SSE 조립 (API-40, app 파사드). 구독은 소유자 검증 후 emitter를 레지스트리에 걸고,
 * 워커가 발행한 진행/종료 이벤트를 받아 구독자에게 흘려보낸다. done 카드·model은 core.card·폴링 규약과 정합.
 *
 * <p>mock은 거의 즉시 끝나므로 구독 시점에 이미 종료됐을 수 있다 — 그때는 라이브 스트림 대신 종료 이벤트를 바로 보낸다.
 * 상태의 진실은 job이며(폴링 폴백), 놓친 이벤트는 재구독·폴링으로 메운다.
 */
@Service
public class AnalysisSseService {

    private static final long TIMEOUT_MS = 60_000L;
    private static final String MODEL = "mock";
    private static final String FAIL_MESSAGE = "AI 분석에 실패했어요. 잠시 후 다시 시도해 주세요.";

    /** 진행 단계 코드 → 표시 문구(05 §5-3). */
    private static final Map<String, String> STEP_LABELS = Map.of(
            "analyzing", "문맥 분석 중",
            "hintGenerating", "힌트 생성 중",
            "stepChaining", "사고 단계 구성 중",
            "diagnosing", "풀이 진단 중");

    private final AnalyzeJobService analyzeJobService;
    private final CardQueryService cardQueryService;
    private final AnalysisSseRegistry registry;

    AnalysisSseService(AnalyzeJobService analyzeJobService,
                       CardQueryService cardQueryService,
                       AnalysisSseRegistry registry) {
        this.analyzeJobService = analyzeJobService;
        this.cardQueryService = cardQueryService;
        this.registry = registry;
    }

    /**
     * 구독 시작. 소유자 검증(403·404)은 스트림 열기 전에 예외로 던져 JSON 에러가 나가게 한다.
     * 이미 종료된 job이면 곧장 done/error를 보내고 닫는다.
     */
    public SseEmitter subscribe(Long userId, Long jobId) {
        AnalyzeJobView view = analyzeJobService.view(jobId, userId);   // 403 · 404 JOB_NOT_FOUND
        SseEmitter emitter = new SseEmitter(TIMEOUT_MS);

        switch (view.status()) {
            case "DONE" -> sendDone(emitter, userId, jobId);
            case "FAILED" -> sendError(emitter);
            default -> registry.register(jobId, userId, emitter);      // PENDING · RUNNING → 라이브 대기
        }
        return emitter;
    }

    @EventListener
    void onProgressed(AnalyzeEvents.AnalyzeProgressed event) {
        String stage = event.stage();
        registry.push(event.jobId(), stage, Map.of("step", STEP_LABELS.getOrDefault(stage, stage)));
    }

    @EventListener
    void onCompleted(AnalyzeEvents.AnalyzeCompleted event) {
        Long jobId = event.jobId();
        Long userId = registry.ownerOf(jobId);
        if (userId == null) {
            return;   // 열린 구독 없음 — 폴링으로 받으면 된다
        }
        registry.pushAndComplete(jobId, "done", doneData(userId, jobId));
    }

    @EventListener
    void onFailed(AnalyzeEvents.AnalyzeFailed event) {
        registry.pushAndComplete(event.jobId(), "error", Map.of("error", FAIL_MESSAGE));
    }

    /** 구독 시점에 이미 DONE인 경우의 즉시 done. */
    private void sendDone(SseEmitter emitter, Long userId, Long jobId) {
        try {
            emitter.send(SseEmitter.event().name("done").data(doneData(userId, jobId)));
            emitter.complete();
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
    }

    private void sendError(SseEmitter emitter) {
        try {
            emitter.send(SseEmitter.event().name("error").data(Map.of("error", FAIL_MESSAGE)));
            emitter.complete();
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
    }

    private Map<String, Object> doneData(Long userId, Long jobId) {
        List<CardSummary> cards = cardQueryService.getCardsByJob(userId, jobId);
        return Map.of("cards", cards, "model", MODEL);
    }
}
