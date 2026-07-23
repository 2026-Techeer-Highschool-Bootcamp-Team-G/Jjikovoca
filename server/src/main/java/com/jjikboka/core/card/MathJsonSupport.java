package com.jjikboka.core.card;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * card.solutions·diagnosis(JSON 문자열)를 객체로 파싱한다 (F-26). 저장은 워커가 JSON 문자열로 하고,
 * 조회 서비스가 여기서 파싱해 노출 규칙(단계 content 제거 등)을 적용한다. 값이 없거나 깨지면 빈/ null로 안전 처리.
 */
@Component
class MathJsonSupport {

    private static final TypeReference<List<Solution>> SOLUTION_LIST = new TypeReference<>() {
    };

    private final ObjectMapper objectMapper;

    MathJsonSupport(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    List<Solution> parseSolutions(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            List<Solution> parsed = objectMapper.readValue(json, SOLUTION_LIST);
            return parsed == null ? List.of() : parsed;
        } catch (Exception e) {
            return List.of();
        }
    }

    MathDiagnosis parseDiagnosis(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, MathDiagnosis.class);
        } catch (Exception e) {
            return null;
        }
    }
}
