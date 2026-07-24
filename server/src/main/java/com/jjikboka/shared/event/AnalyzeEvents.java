package com.jjikboka.shared.event;

/**
 * 모듈 간 인프로세스 이벤트 계약 (13 §6).
 * 지금은 스프링 이벤트로 발행/구독하지만, 이 DTO가 그대로 미래의 큐 메시지가 된다
 * (10 전환 3단계에서 발행/구독 어댑터만 교체 — 계약 불변).
 * shared에 고정 = 어느 도메인에도 속하지 않는 공용 계약.
 */
public final class AnalyzeEvents {

    /**
     * core.card 발행 — quota 차감·job 접수 후 AFTER_COMMIT (outbox 인프로세스 유사물).
     * cropImageRefs는 저장된 크롭 파일명들(첫 개가 card.image_path), fullImageRef는 지문 파일명(WORD 문맥 판별용, 없으면 null).
     * 워커가 이 참조로 이미지를 로드해 비전 입력으로 넘긴다(base64 원문은 이벤트에 싣지 않는다 — 큐 전환 대비).
     */
    public record AnalyzeRequested(Long jobId, Long userId, String type,
                                   java.util.List<String> cropImageRefs, String fullImageRef) {}

    /** analysis 발행 — 진행 단계마다 (SSE 단계 이벤트, 05 §5-3) */
    public record AnalyzeProgressed(Long jobId, String stage) {}

    /** analysis 발행 — 성공 */
    public record AnalyzeCompleted(Long jobId, String resultRef) {}

    /** analysis 발행 — 최종 실패 → core가 quota 환불(멱등, 13 §6) */
    public record AnalyzeFailed(Long jobId, String reason) {}

    private AnalyzeEvents() {}
}
