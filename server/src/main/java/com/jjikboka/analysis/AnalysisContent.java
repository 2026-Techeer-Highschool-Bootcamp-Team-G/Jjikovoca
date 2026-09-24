package com.jjikboka.analysis;

/**
 * 분석 산출 콘텐츠 (analysis 공개 DTO, API-6 처리). Gemini(또는 모의)가 채운 단어 카드 필드를 담아 app에 넘긴다.
 * app이 이걸 core.card의 생성 커맨드로 옮겨 카드를 만든다(슬라이스 간 직접참조 금지, 13 §2).
 *
 * <p>영어 단어(WORD) 전용 — word·뜻·예문·발음·품사·유형태그·이모지를 채운다. model은 사용한 모델 이름(모의 단계는 "mock").
 * concept은 약한 개념 리포트(오답 통계)용 분류값으로, 미채움이면 null이다.
 */
public record AnalysisContent(
        String model,
        String subject,
        String word,
        String contextMeaning,
        String dictMeaning,
        String example,
        String exampleMeaning,   // 예문의 한글 뜻(플래시카드 앞면: 예문 + 예문뜻)
        // enrichment (Phase 5) — 발음(IPA)·품사·유형태그·이모지
        String pronunciation,
        String pos,
        java.util.List<String> tags,
        String emoji,
        String concept           // 약한 개념 리포트용 분류(미채움 null)
) {
}
