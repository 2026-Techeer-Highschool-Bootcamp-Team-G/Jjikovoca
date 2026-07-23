package com.jjikboka.analysis;

/**
 * 분석 모델 클라이언트 (API-6). 지금은 모의 구현({@link MockGeminiClient})만 있고, 실 Gemini 전환 시
 * 이 인터페이스 구현만 갈아끼운다(계약 불변, 모의 우선 방침). 공개 인터페이스라 app 워커가 주입해 쓴다.
 */
public interface GeminiClient {

    /** 카드 타입(WORD/PROBLEM)에 맞는 분석 콘텐츠를 생성한다. */
    AnalysisContent generate(String type);

    /** 주어진 단어(숙어 포함)를 담은 새 예문을 생성한다(API-16 예문 재생성). 세션용 — 카드 원문은 바꾸지 않는다. */
    String generateExample(String word);
}
