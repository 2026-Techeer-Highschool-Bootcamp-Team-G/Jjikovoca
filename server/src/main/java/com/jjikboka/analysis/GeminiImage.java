package com.jjikboka.analysis;

/**
 * Gemini 비전 입력 이미지 (API-6). 접수 때 저장한 크롭/지문을 워커가 로드해 이 형태로 넘긴다.
 * mimeType은 inline_data.mime_type, data는 원본 바이트(실 구현이 base64로 인코딩) — 계약은 슬라이스 밖에서도 쓰이므로 public.
 */
public record GeminiImage(String mimeType, byte[] data) {
}
