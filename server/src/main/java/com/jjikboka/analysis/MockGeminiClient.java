package com.jjikboka.analysis;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * 모의 Gemini (API-6, 모의 우선). 키·원가 없이 카드 생성 흐름을 끝까지 돌리기 위한 고정 응답이다.
 * 타입별로 그럴듯한 필드를 채우고 model은 "mock"으로 표시한다.
 *
 * <p>{@code gemini.mock=true}(기본, 미설정 포함)일 때 활성. false면 {@link RealGeminiClient}가 대신 뜬다 —
 * 계약이 같아 app 워커는 어느 쪽이 주입돼도 그대로 동작한다(13 §2).
 */
@Component
@ConditionalOnProperty(prefix = "gemini", name = "mock", havingValue = "true", matchIfMissing = true)
class MockGeminiClient implements GeminiClient {

    private static final String MODEL = "mock";

    private static final String MOCK_SOLUTIONS = """
            [{"index":0,"label":"인수분해","steps":[\
            {"no":1,"title":"1단계","question":"무엇을 구하는 문제인가?","content":"두 근을 찾는 이차방정식이다."},\
            {"no":2,"title":"2단계","question":"어떻게 인수분해할까?","content":"곱해서 6, 더해서 5인 두 수는 2와 3."}],\
            "explanation":"곱해서 6, 더해서 5가 되는 두 수 2와 3으로 (x-2)(x-3)=0."}]""";

    private static final String MOCK_DIAGNOSIS =
            "{\"failedStep\":3,\"description\":\"이항 부호 오류\",\"suggestedReason\":\"MISTAKE\"}";

    @Override
    public AnalysisContent generate(String type, java.util.List<GeminiImage> images) {
        // 모의 구현은 이미지를 쓰지 않는다(고정 응답). 실 전환 시 RealGeminiClient가 images를 비전 입력으로 넣는다.
        if ("PROBLEM".equals(type)) {
            return new AnalysisContent(
                    MODEL, "MATH",
                    null, null, null, null,
                    null, null, null, null,   // WORD enrichment 미해당(PROBLEM)
                    "이차방정식의 근과 계수의 관계를 묻는 문제",
                    "x^2 - 5x + 6 = 0",
                    "이차방정식",
                    "두 근의 합과 곱을 계수로 표현해 보세요.",
                    "근과 계수의 관계: 합 = -b/a, 곱 = c/a",
                    "인수분해하면 (x-2)(x-3)=0",
                    "NUMERIC",
                    MOCK_SOLUTIONS, "2, 3", MOCK_DIAGNOSIS);
        }
        return new AnalysisContent(
                MODEL, "ENGLISH",
                "sound",
                "타당한, 믿을 만한",
                "① 소리 ② 건전한, 타당한 ③ (잠이) 깊은",
                "That's a sound argument.",
                "/saʊnd/", "형용사", java.util.List.of("수능", "빈출", "형용사"), "🔊",   // WORD enrichment
                null, null, null, null, null, null, null,
                null, null, null);
    }

    @Override
    public String generateExample(String word) {
        // 모의 새 예문 — 반드시 word(또는 그 토큰)를 포함해 빈칸 처리가 되도록 한다. 실 전환 시 이 구현만 교체.
        return "She decided to " + word + " the situation herself.";
    }

    @Override
    public String generateSolutionJson(String latex) {
        // 모의 다른 풀이(근의 공식) — index는 core.card가 붙인다. 실 전환 시 이 구현만 교체.
        return """
                {"label":"근의 공식","steps":[\
                {"no":1,"title":"1단계","question":"판별식을 구해볼까요?","content":"D=b^2-4ac=25-24=1"},\
                {"no":2,"title":"2단계","question":"근의 공식에 대입하면?","content":"x=(5±√1)/2 이므로 3, 2"}],\
                "explanation":"근의 공식 x=(-b±√D)/2a에 대입해 x=3, 2를 얻는다."}""";
    }
}
