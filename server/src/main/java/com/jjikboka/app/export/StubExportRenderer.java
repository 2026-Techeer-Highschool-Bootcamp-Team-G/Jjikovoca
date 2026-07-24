package com.jjikboka.app.export;

import com.jjikboka.core.card.CardSummary;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * 텍스트 스텁 렌더러 (API-25, 기본). 카드 요약을 줄글 .txt로 만든다 — 브라우저 바이너리 없이 로컬/CI에서 흐름이 돈다.
 * {@code app.export.renderer}가 chromium이 아니면(기본) 활성. WORD는 단어·문맥 뜻, PROBLEM은 개념·요약(정답 미노출, 13 §7).
 */
@Component
@ConditionalOnProperty(prefix = "app.export", name = "renderer", havingValue = "stub", matchIfMissing = true)
class StubExportRenderer implements ExportRenderer {

    @Override
    public Rendered render(String type, List<CardSummary> cards) {
        StringBuilder body = new StringBuilder("찍어보카 내보내기 (").append(type).append(")\n\n");
        int index = 1;
        for (CardSummary card : cards) {
            body.append(index++).append(". ");
            if ("WORD".equals(card.type())) {
                body.append(nullToDash(card.word())).append(" — ").append(nullToDash(card.contextMeaning()));
            } else {
                body.append(nullToDash(card.concept())).append(" — ").append(nullToDash(card.summary()));
            }
            body.append('\n');
        }
        return new Rendered(body.toString().getBytes(StandardCharsets.UTF_8), "txt");
    }

    private String nullToDash(String value) {
        return value == null ? "-" : value;
    }
}
