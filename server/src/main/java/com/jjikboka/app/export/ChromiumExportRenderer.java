package com.jjikboka.app.export;

import com.jjikboka.core.card.CardSummary;
import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
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

    private static final Logger log = LoggerFactory.getLogger(ChromiumExportRenderer.class);
    private static final String WORD_TEST_TEMPLATE = "templates/export/word-test.html";

    /** Chromium 실패 시 폴백 엔진 — PdfBoxExportRenderer는 주입 의존성이 없어 직접 인스턴스화한다(브라우저 없이 항상 동작). */
    private final PdfBoxExportRenderer fallback = new PdfBoxExportRenderer();

    /**
     * Chromium으로 렌더하되, 브라우저 미설치·구동 실패·폰트 문제 등으로 예외가 나면 pdfbox(구 포맷)로 폴백해
     * export가 통째로 실패(job FAILED·환불)하는 것을 막는다. 폴백은 WARN 로그로 드러내 은폐하지 않는다(원인 추적).
     */
    @Override
    public Rendered render(String type, List<CardSummary> cards) {
        try {
            return renderWithChromium(type, cards);
        } catch (RuntimeException e) {
            log.warn("Chromium 렌더 실패 — pdfbox 구 포맷으로 폴백. 원인: {}", e.toString());
            return fallback.render(type, cards);
        }
    }

    private Rendered renderWithChromium(String type, List<CardSummary> cards) {
        boolean image = "JPG_CARD".equals(type);
        String html = "PDF_WORDTEST".equals(type) ? buildWordTestHtml(cards) : buildHtml(type, cards);
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

    /**
     * 단어 테스트 PDF(PDF_WORDTEST) — 리소스 템플릿(word-test.html)에 데이터를 주입한다. 디자인(HTML·CSS)은 자산으로 분리하고
     * 여기선 번호+단어(필기선)·번호+한글뜻 조각만 만들어 자리표시자를 치환한다. 정답 미노출 원칙과 무관(뜻은 정답선으로 분리 인쇄).
     */
    private String buildWordTestHtml(List<CardSummary> cards) {
        StringBuilder words = new StringBuilder();
        StringBuilder answers = new StringBuilder();
        int index = 1;
        for (CardSummary card : cards) {
            words.append("<li class=\"item\"><span class=\"num\">").append(index)
                    .append("</span><span class=\"word\">").append(escape(card.word()))
                    .append("</span><span class=\"line\"></span></li>");
            answers.append("<li class=\"answer\"><span class=\"num\">").append(index)
                    .append(".</span> ").append(escape(card.contextMeaning())).append("</li>");
            index++;
        }
        return loadTemplate(WORD_TEST_TEMPLATE)
                .replace("{{COUNT}}", String.valueOf(cards.size()))
                .replace("{{WORDS}}", words.toString())
                .replace("{{ANSWERS}}", answers.toString());
    }

    /** 클래스패스 템플릿을 UTF-8 문자열로 읽는다. 없으면 배포 누락이므로 즉시 예외(렌더 실패 → 워커 환불). */
    private String loadTemplate(String path) {
        try (InputStream in = getClass().getClassLoader().getResourceAsStream(path)) {
            if (in == null) {
                throw new IllegalStateException("내보내기 템플릿을 찾을 수 없습니다: " + path);
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new UncheckedIOException("내보내기 템플릿 읽기 실패: " + path, e);
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
