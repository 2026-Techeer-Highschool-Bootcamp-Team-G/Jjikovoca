package com.jjikboka.analysis;

/**
 * 분석 산출 콘텐츠 (analysis 공개 DTO, API-6 처리). Gemini(또는 모의)가 채운 카드 필드를 담아 app에 넘긴다.
 * app이 이걸 core.card의 생성 커맨드로 옮겨 카드를 만든다(슬라이스 간 직접참조 금지, 13 §2).
 *
 * <p>타입별로 채워지는 필드가 다르다 — WORD는 word·뜻·예문, PROBLEM은 요약·힌트·정답형식 + F-26 사고과정.
 * model은 사용한 모델 이름(모의 단계는 "mock"). solutionsJson·diagnosisJson은 JSON 문자열 그대로 넘긴다.
 */
public record AnalysisContent(
        String model,
        String subject,
        // WORD
        String word,
        String contextMeaning,
        String dictMeaning,
        String example,
        // WORD enrichment (Phase 5) — 발음(IPA)·품사·유형태그·이모지
        String pronunciation,
        String pos,
        java.util.List<String> tags,
        String emoji,
        // PROBLEM
        String summary,
        String latex,
        String concept,
        String hint1,
        String hint2,
        String hint3,
        String answerFormat,
        // PROBLEM — F-26 사고과정
        String solutionsJson,
        String answerValue,
        String diagnosisJson
) {
}
