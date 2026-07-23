package com.jjikboka.app.study;

/**
 * 빈칸 답 제출 요청 (Notion API-ID 15). guess 누락은 서비스에서 400 MISSING_GUESS로 던진다(스펙 errorName 정합).
 * guess는 전체 단어 또는 빈칸 토큰 모두 정답 인정(숙어 대응).
 */
public record ClozeAnswerRequest(
        String guess,
        Integer durationMs
) {
}
