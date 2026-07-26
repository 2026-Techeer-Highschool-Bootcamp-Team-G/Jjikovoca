package com.jjikboka.app.export;

import com.jjikboka.core.card.CardSummary;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * 경량 PDF 렌더러 (API-25, 기본). 브라우저(Playwright) 없이 PDFBox로 카드 요약을 직접 PDF로 만든다 —
 * 로컬·CI·EC2 컨테이너 어디서나 바이너리 설치 없이 동작한다. {@code app.export.renderer}가 지정되지 않으면(기본) 활성.
 *
 * <p>한글은 번들 폰트(NanumGothic, OFL)를 <b>전체 임베드</b>해 렌더한다(서브셋 마무리 없이 래스터화까지 안전).
 * PDF_NOTE·PDF_WORDTEST는 PDF, JPG_CARD는 같은 페이지를 래스터화한 PNG. 정답 미노출(13 §7): 입력이
 * {@link CardSummary}라 정답·풀이가 애초에 담기지 않는다. 폰트에 없는 글자(이모지 등)는 공백으로 치환해 렌더 실패를 막는다.
 */
@Component
@ConditionalOnProperty(prefix = "app.export", name = "renderer", havingValue = "pdfbox", matchIfMissing = true)
class PdfBoxExportRenderer implements ExportRenderer {

    private static final String FONT_PATH = "fonts/NanumGothic-Regular.ttf";
    private static final float MARGIN = 50f;
    private static final float TITLE_SIZE = 18f;
    private static final float HEAD_SIZE = 13f;
    private static final float BODY_SIZE = 11f;
    private static final float LINE_GAP = 6f;
    private static final int RASTER_DPI = 150;

    @Override
    public Rendered render(String type, List<CardSummary> cards) {
        try (PDDocument doc = new PDDocument()) {
            PDType0Font font = loadFont(doc);
            writeContent(doc, font, type, cards);
            if ("JPG_CARD".equals(type)) {
                return new Rendered(rasterizeFirstPage(doc), "png");
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return new Rendered(out.toByteArray(), "pdf");
        } catch (IOException e) {
            throw new IllegalStateException("PDF 내보내기 렌더 실패", e);
        }
    }

    private PDType0Font loadFont(PDDocument doc) throws IOException {
        try (InputStream is = new ClassPathResource(FONT_PATH).getInputStream()) {
            return PDType0Font.load(doc, is, false);   // 전체 임베드 — 래스터화(JPG_CARD) 시 글리프 누락 방지
        }
    }

    private void writeContent(PDDocument doc, PDType0Font font, String type, List<CardSummary> cards) throws IOException {
        Layout layout = new Layout(doc, font);
        layout.paragraph(TITLE_SIZE, "찍어보카 오답노트 (" + nn(type) + ")");
        layout.space(LINE_GAP);
        int index = 1;
        for (CardSummary card : cards) {
            boolean word = "WORD".equals(card.type());
            String head = word ? card.word() : card.concept();
            String body = word ? card.contextMeaning() : card.summary();
            layout.paragraph(HEAD_SIZE, index++ + ". " + nn(head));
            layout.paragraph(BODY_SIZE, "    " + nn(body));
            layout.space(LINE_GAP);
        }
        layout.finish();
    }

    /** 첫 페이지를 이미지로 래스터화(JPG_CARD). 같은 레이아웃을 재사용해 별도 렌더 경로를 두지 않는다. */
    private byte[] rasterizeFirstPage(PDDocument doc) throws IOException {
        PDFRenderer renderer = new PDFRenderer(doc);
        BufferedImage image = renderer.renderImageWithDPI(0, RASTER_DPI);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(image, "png", out);
        return out.toByteArray();
    }

    private static String nn(String value) {
        return value == null ? "-" : value;
    }

    /**
     * 페이지 상태(현재 페이지·컨텐트 스트림·y커서)를 렌더마다 새로 들고 페이지네이션·줄바꿈을 처리한다.
     * 싱글턴 렌더러의 필드로 두면 동시 렌더에 안전하지 않으므로 render마다 인스턴스를 만든다.
     */
    private static final class Layout {

        private final PDDocument doc;
        private final PDType0Font font;
        private final float maxWidth;
        private PDPageContentStream cs;
        private float y;

        Layout(PDDocument doc, PDType0Font font) throws IOException {
            this.doc = doc;
            this.font = font;
            this.maxWidth = PDRectangle.A4.getWidth() - 2 * MARGIN;
            newPage();
        }

        /** 한 문단 — 폭 기준으로 줄바꿈하고, 페이지 끝에 닿으면 새 페이지로 넘긴다. */
        void paragraph(float size, String rawText) throws IOException {
            for (String line : wrap(size, sanitize(rawText))) {
                if (y - size < MARGIN) {
                    newPage();
                }
                cs.beginText();
                cs.setFont(font, size);
                cs.newLineAtOffset(MARGIN, y);
                cs.showText(line);
                cs.endText();
                y -= size + LINE_GAP;
            }
        }

        void space(float dy) {
            y -= dy;
        }

        void finish() throws IOException {
            cs.close();
        }

        private void newPage() throws IOException {
            if (cs != null) {
                cs.close();
            }
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);
            cs = new PDPageContentStream(doc, page);
            y = PDRectangle.A4.getHeight() - MARGIN;
        }

        /** 폰트에 없는 글자(이모지 등)·개행/탭은 공백으로 — showText가 던지지 않게. */
        private String sanitize(String text) {
            if (text == null || text.isEmpty()) {
                return "-";
            }
            StringBuilder sb = new StringBuilder();
            text.codePoints().forEach(cp -> {
                if (cp == '\n' || cp == '\r' || cp == '\t') {
                    sb.append(' ');
                    return;
                }
                String s = new String(Character.toChars(cp));
                try {
                    font.getStringWidth(s);
                    sb.append(s);
                } catch (Exception e) {
                    sb.append(' ');
                }
            });
            return sb.toString();
        }

        /** 폭(maxWidth) 기준 글자 단위 줄바꿈 — 한글은 공백이 드물어 단어 단위가 아닌 글자 단위로 감는다. */
        private List<String> wrap(float size, String text) throws IOException {
            List<String> lines = new ArrayList<>();
            StringBuilder cur = new StringBuilder();
            int i = 0;
            while (i < text.length()) {
                int cp = text.codePointAt(i);
                i += Character.charCount(cp);
                String ch = new String(Character.toChars(cp));
                float width = font.getStringWidth(cur + ch) / 1000f * size;
                if (width > maxWidth && cur.length() > 0) {
                    lines.add(cur.toString());
                    cur = new StringBuilder(ch);
                } else {
                    cur.append(ch);
                }
            }
            if (cur.length() > 0) {
                lines.add(cur.toString());
            }
            if (lines.isEmpty()) {
                lines.add("");
            }
            return lines;
        }
    }
}
