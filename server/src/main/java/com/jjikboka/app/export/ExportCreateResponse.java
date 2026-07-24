package com.jjikboka.app.export;

/**
 * 내보내기 생성 응답 (Notion API-ID 25). 다운로드 URL과 만료(초)를 준다 — 파일은 downloadUrl(GET)으로 받는다.
 */
public record ExportCreateResponse(String downloadUrl, int expiresIn) {
}
