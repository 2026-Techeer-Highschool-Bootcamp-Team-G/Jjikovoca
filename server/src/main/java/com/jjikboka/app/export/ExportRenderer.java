package com.jjikboka.app.export;

import com.jjikboka.core.card.CardSummary;

import java.util.List;

/**
 * 내보내기 렌더러 계약 (API-25). 카드 요약을 파일 바이트로 렌더한다 — 구현은 {@code app.export.renderer}로 토글한다:
 * 텍스트 스텁({@link StubExportRenderer}) / headless Chromium PDF·PNG({@link ChromiumExportRenderer}).
 *
 * <p>정답 미노출(13 §7): 입력이 {@link CardSummary}라 정답·풀이가 애초에 담기지 않는다. 반환의 확장자는
 * 저장·다운로드 파일명이 쓰고, 생성→다운로드 계약(downloadUrl·expiresIn)은 어느 구현이든 불변이다.
 */
interface ExportRenderer {

    /** type(PDF_NOTE·PDF_WORDTEST·JPG_CARD)에 맞춰 카드 요약을 렌더한다. */
    Rendered render(String type, List<CardSummary> cards);

    /** 렌더 산출 — 파일 바이트와 확장자(txt·pdf·png). */
    record Rendered(byte[] content, String extension) {
    }
}
