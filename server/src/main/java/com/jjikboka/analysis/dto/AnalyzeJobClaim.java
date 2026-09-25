package com.jjikboka.analysis.dto;

/**
 * claim 성공한 job의 처리 컨텍스트 (analysis 공개 DTO, P1-6). app 워커가 이 값으로 payload를 복원해
 * 분석을 재구성한다 — 이벤트 없이 job만으로 처리 가능하게 하는 다리다(엔티티는 밖에서 비공개, 13 §2).
 *
 * <p>payloadJson은 접수 때 job에 저장한 재구성 payload(type·cropImageRefs·words·fullImageRef) 원문이다.
 * attempts는 이번 claim까지의 시도 횟수 — 상한 판정은 서비스가 하지만, 관측용으로 함께 넘긴다.
 */
public record AnalyzeJobClaim(Long jobId, Long userId, String payloadJson, int attempts) {
}
