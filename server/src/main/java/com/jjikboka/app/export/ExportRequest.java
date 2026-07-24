package com.jjikboka.app.export;

import java.util.List;

/**
 * 내보내기 생성 요청 (Notion API-ID 25). type은 PDF_NOTE·PDF_WORDTEST·JPG_CARD, cardIds는 대상(미지정 시 전체).
 */
public record ExportRequest(String type, List<Long> cardIds) {
}
