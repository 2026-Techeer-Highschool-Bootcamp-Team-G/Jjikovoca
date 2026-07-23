package com.jjikboka.core.card;

/**
 * 카드 생성 커맨드 (core.card 공개 입력 DTO, API-6 처리). analysis가 만든 콘텐츠를 app이 이 커맨드로 옮겨
 * core.card에 넘긴다 — 슬라이스 간 DTO를 직접 공유하지 않으려는 경계 장치(13 §2).
 *
 * <p>mock=true, boxLevel=0으로 새 오답 카드를 만든다. imagePath는 모의 단계엔 null(실 이미지 저장은 실 전환 시).
 */
public record CardCreateCommand(
        Long userId,
        Long analyzeJobId,
        String type,
        String subject,
        String imagePath,
        // WORD
        String word,
        String contextMeaning,
        String dictMeaning,
        String example,
        // PROBLEM
        String summary,
        String latex,
        String concept,
        String hint1,
        String hint2,
        String hint3,
        String answerFormat,
        // PROBLEM — F-26 사고과정(JSON 문자열)
        String solutionsJson,
        String answerValue,
        String diagnosisJson
) {
}
