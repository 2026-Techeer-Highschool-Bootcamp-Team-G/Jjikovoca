package com.jjikboka.app.export;

import com.jjikboka.core.card.CardSummary;
import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * headless Chromium 렌더러 (API-25). 카드 요약을 HTML로 조립해 Playwright가 띄운 Chromium으로 PDF/PNG를 만든다.
 * {@code app.export.renderer=chromium}일 때만 활성 — JPG_CARD는 스크린샷(PNG), 나머지(PDF_NOTE·PDF_WORDTEST)는 PDF.
 *
 * <p>브라우저 바이너리는 첫 렌더에 자동 다운로드되거나 {@code playwright install chromium}으로 준비한다.
 * 내보내기가 드물어 렌더마다 Playwright를 띄우고 닫는다(try-with-resources) — 리소스 누수 없이 단순하게 간다.
 * 입력이 {@link CardSummary}라 정답·풀이는 애초에 담기지 않는다(13 §7). 필드는 HTML 이스케이프해 깨짐/주입을 막는다.
 */
@Component
@ConditionalOnProperty(prefix = "app.export", name = "renderer", havingValue = "chromium")
class ChromiumExportRenderer implements ExportRenderer {

    @Override
    public Rendered render(String type, List<CardSummary> cards) {
        boolean image = "JPG_CARD".equals(type);
        String html = buildHtml(type, cards);
        try (Playwright playwright = Playwright.create()) {
            Browser browser = playwright.chromium().launch(new BrowserType.LaunchOptions().setHeadless(true));
            try {
                Page page = browser.newPage();
                page.setContent(html);
                byte[] content = image
                        ? page.screenshot(new Page.ScreenshotOptions().setFullPage(true))
                        : page.pdf(new Page.PdfOptions().setFormat("A4").setPrintBackground(true));
                return new Rendered(content, image ? "png" : "pdf");
            } finally {
                browser.close();
            }
        }
    }

    /** 카드 요약 → 인쇄용 HTML. WORD는 단어·문맥 뜻, PROBLEM은 개념·요약(정답 미노출). */
    private String buildHtml(String type, List<CardSummary> cards) {
        StringBuilder rows = new StringBuilder();
        int index = 1;
        for (CardSummary card : cards) {
            String head;
            String body;
            if ("WORD".equals(card.type())) {
                head = escape(card.word());
                body = escape(card.contextMeaning());
            } else {
                head = escape(card.concept());
                body = escape(card.summary());
            }
            rows.append("<li><span class=\"h\">").append(index++).append(". ").append(head)
                    .append("</span><span class=\"b\">").append(body).append("</span></li>");
        }
        return """
                <!doctype html><html lang="ko"><head><meta charset="utf-8"><style>
                  body{font-family:-apple-system,'Apple SD Gothic Neo',sans-serif;padding:32px;color:#191f28}
                  h1{font-size:20px;color:#3182f6;margin:0 0 24px}
                  ul{list-style:none;padding:0} li{padding:12px 0;border-bottom:1px solid #eee}
                  .h{font-weight:700;display:block} .b{color:#4e5968;font-size:14px}
                </style></head><body><h1>찍어보카 오답노트 (%s)</h1><ul>%s</ul></body></html>
                """.formatted(escape(type), rows.toString());
    }

    private String escape(String value) {
        if (value == null) {
            return "-";
        }
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
