package com.jjikboka.analysis.service;

import com.jjikboka.analysis.dto.AnalysisContent;
import com.jjikboka.analysis.dto.GeminiImage;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * 모의 Gemini (API-6, 모의 우선). 키·원가 없이 단어 카드 생성 흐름을 끝까지 돌리기 위한 고정 응답이다.
 * 그럴듯한 WORD 필드를 채우고 model은 "mock"으로 표시한다.
 *
 * <p>{@code gemini.mock=true}(기본, 미설정 포함)일 때 활성. false면 {@link RealGeminiClient}가 대신 뜬다 —
 * 계약이 같아 app 워커는 어느 쪽이 주입돼도 그대로 동작한다(13 §2).
 */
@Component
@ConditionalOnProperty(prefix = "gemini", name = "mock", havingValue = "true", matchIfMissing = true)
public class MockGeminiClient implements GeminiClient {

    private static final String MODEL = "mock";

    @Override
    public AnalysisContent generate(String type, java.util.List<GeminiImage> images) {
        // 모의 구현은 이미지를 쓰지 않는다(고정 응답). 실 전환 시 RealGeminiClient가 images를 비전 입력으로 넣는다.
        return new AnalysisContent(
                MODEL, "ENGLISH",
                "sound",
                "타당한, 믿을 만한",
                "① 소리 ② 건전한, 타당한 ③ (잠이) 깊은",
                "That's a sound argument.",
                "그건 타당한 주장이야.",   // 예문 한글뜻
                "/saʊnd/", "형용사", java.util.List.of("수능", "빈출", "형용사"), "🔊",   // enrichment
                null);   // concept 미채움
    }

    @Override
    public String generateExample(String word) {
        // 모의 새 예문 — 반드시 word(또는 그 토큰)를 포함해 빈칸 처리가 되도록 한다. 실 전환 시 이 구현만 교체.
        return "She decided to " + word + " the situation herself.";
    }

    @Override
    public String generateMnemonicImage(String word, String meaning) {
        // 모의 연상 이미지 — 1x1 투명 PNG data URL(비용·키 없이 흐름 검증). 실 전환 시 이 구현만 교체.
        return "data:image/png;base64,"
                + "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    }
}
