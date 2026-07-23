package com.jjikboka.core.review;

/**
 * 학습 기록 커맨드 (core.review 공개 입력 DTO, API-11). app이 검증을 마친 학습 결과를 이 커맨드로 넘겨 원장에 남긴다.
 * detail은 F-26 MATH_REVIEW 등의 단계 로그를 담은 JSON 문자열(없으면 null).
 */
public record StudyRecordCommand(
        Long userId,
        Long cardId,
        String activity,
        String result,
        String reasonTag,
        Integer durationMs,
        String detail
) {
}
