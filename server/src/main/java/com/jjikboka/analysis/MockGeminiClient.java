package com.jjikboka.analysis;

import org.springframework.stereotype.Component;

/**
 * 모의 Gemini (API-6, 모의 우선). 키·원가 없이 카드 생성 흐름을 끝까지 돌리기 위한 고정 응답이다.
 * 타입별로 그럴듯한 필드를 채우고 model은 "mock"으로 표시한다 — 실 전환 시 이 클래스만 실 구현으로 교체한다.
 */
@Component
class MockGeminiClient implements GeminiClient {

    private static final String MODEL = "mock";

    @Override
    public AnalysisContent generate(String type) {
        if ("PROBLEM".equals(type)) {
            return new AnalysisContent(
                    MODEL, "MATH",
                    null, null, null, null,
                    "이차방정식의 근과 계수의 관계를 묻는 문제",
                    "x^2 - 5x + 6 = 0",
                    "이차방정식",
                    "두 근의 합과 곱을 계수로 표현해 보세요.",
                    "근과 계수의 관계: 합 = -b/a, 곱 = c/a",
                    "인수분해하면 (x-2)(x-3)=0",
                    "NUMERIC");
        }
        return new AnalysisContent(
                MODEL, "ENGLISH",
                "sound",
                "타당한, 믿을 만한",
                "① 소리 ② 건전한, 타당한 ③ (잠이) 깊은",
                "That's a sound argument.",
                null, null, null, null, null, null, null);
    }
}
