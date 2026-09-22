package com.jjikboka.app.analysis;

import java.util.List;

/**
 * 분석 재구성 payload (P1-6, app 내부 계약). 접수 때 job의 payload_json에 저장하고, @Async·watchdog가 처리 시
 * 이 값으로 이미지 참조·타입을 복원해 이벤트 없이 재분석한다 — 크래시·이벤트 유실에도 job만으로 재구성 가능.
 *
 * <p>base64 원문은 싣지 않는다(파일명 참조만) — JSON 크기를 작게 유지하고 저장소가 진실 소스가 되게 한다.
 * words는 OCR 단어 힌트(선택), fullImageRef는 WORD 문맥용 지문(없으면 null).
 */
public record AnalyzePayload(String type, List<String> cropImageRefs, List<String> words, String fullImageRef) {
}
