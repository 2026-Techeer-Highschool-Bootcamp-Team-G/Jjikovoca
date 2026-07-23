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

    /** AI가 만든 단건 풀이 JSON을 파싱한다(API-41). index는 없을 수 있어(0으로) 호출부가 다시 붙인다. 실패면 null. */
    Solution parseSolution(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, Solution.class);
        } catch (Exception e) {
            return null;
        }
    }

    /** 풀이 목록을 card.solutions에 저장할 JSON 문자열로 직렬화한다(API-41 append). content 포함(단계 공개 30 열람용). */
    String writeSolutions(List<Solution> solutions) {
        try {
            return objectMapper.writeValueAsString(solutions);
        } catch (Exception e) {
            throw new IllegalStateException("풀이 직렬화 실패", e);
        }
    }
}
