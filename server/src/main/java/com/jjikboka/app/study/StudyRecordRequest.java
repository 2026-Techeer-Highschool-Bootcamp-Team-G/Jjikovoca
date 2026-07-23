package com.jjikboka.app.study;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * 학습 기록 요청 (Notion API-ID 11). enum 허용값·RETRY+CONFUSED 금지 검증은 서비스에서 하고,
 * 위반 시 400 INVALID_STUDY_RESULT로 던진다(공통 VALIDATION_ERROR와 구분되는 스펙 errorName).
 *
 * <p>detail은 F-26 MATH_REVIEW 단계 로그 등 자유 JSON — 그대로 study_log.detail(JSON)로 저장한다.
 */
public record StudyRecordRequest(
        String activity,
        String result,
        String reasonTag,
        Integer durationMs,
        JsonNode detail
) {
}
