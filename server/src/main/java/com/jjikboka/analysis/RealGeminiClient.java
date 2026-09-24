package com.jjikboka.analysis;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 실 Gemini 클라이언트 (API-6·16·41). {@code gemini.mock=false}일 때만 활성 — {@link GeminiApi}로 generateContent를 호출하고
 * 응답 JSON을 {@link AnalysisContent}/문자열로 옮긴다. 계약은 {@link MockGeminiClient}와 같아 app 워커는 그대로 동작한다(13 §2).
 *
 * <p>캡처 분석은 크롭/지문을 비전 입력으로 넣고 타입별 JSON을 받는다(responseMimeType=application/json).
 * solutions·diagnosis는 중첩 구조라 JSON 문자열로 재직렬화해 넘긴다(AnalysisContent 계약). 파싱 실패는 예외 → 워커가 환불.
 */
@Component
@ConditionalOnProperty(prefix = "gemini", name = "mock", havingValue = "false")
class RealGeminiClient implements GeminiClient {

    private static final String MODEL = "gemini";

    private static final String WORD_PROMPT = """
            다음은 학생이 형광펜으로 표시한 영어 단어(들)의 크롭 이미지와 지문 전체 이미지다.
            표시된 핵심 단어 또는 숙어를 분석해 아래 JSON만 출력하라(코드블록·설명 없이).
            {
              "subject": "ENGLISH",
              "word": "표시된 표제어(원형)",
              "contextMeaning": "이 지문 문맥에서의 뜻(한국어)",
              "dictMeaning": "사전적 여러 뜻(한국어, ①②③ 번호)",
              "example": "이 단어를 자연스럽게 포함한 새 영어 예문 한 문장",
              "exampleMeaning": "위 example 문장의 자연스러운 한국어 번역",
              "pronunciation": "IPA 발음기호 (예: /saʊnd/)",
              "pos": "품사(한국어, 예: 명사/동사/형용사/부사)",
              "tags": ["유형 태그 2~4개(예: 수능, 빈출, 동사)"],
              "emoji": "단어를 상징하는 이모지 1개"
            }
            """;

    /**
     * WORD 구조화 출력 스키마(#369). flash-lite가 example·exampleMeaning 등을 생략하지 못하게 required로 강제한다 —
     * responseMimeType만으론 필드 누락을 못 막아 예문/해석이 null로 저장되던 문제를 근본 차단. subject는 fallback(ENGLISH)이라 선택.
     */
    private static final Map<String, Object> WORD_SCHEMA = buildWordSchema();

    /** 예문 보정용 스키마(#399) — example·exampleMeaning 두 필드를 required로 강제. */
    private static final Map<String, Object> PAIR_SCHEMA = buildPairSchema();

    private static Map<String, Object> buildPairSchema() {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("example", strType());
        properties.put("exampleMeaning", strType());
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "OBJECT");
        schema.put("properties", properties);
        schema.put("required", List.of("example", "exampleMeaning"));
        return schema;
    }

    private static Map<String, Object> buildWordSchema() {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("subject", strType());
        properties.put("word", strType());
        properties.put("contextMeaning", strType());
        properties.put("dictMeaning", strType());
        properties.put("example", strType());
        properties.put("exampleMeaning", strType());
        properties.put("pronunciation", strType());
        properties.put("pos", strType());
        properties.put("tags", Map.of("type", "ARRAY", "items", strType()));
        properties.put("emoji", strType());

        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "OBJECT");
        schema.put("properties", properties);
        schema.put("required", List.of("word", "contextMeaning", "dictMeaning", "example", "exampleMeaning",
                "pronunciation", "pos", "tags", "emoji"));
        return schema;
    }

    private static Map<String, Object> strType() {
        return Map.of("type", "STRING");
    }

    private final GeminiApi geminiApi;
    private final ObjectMapper objectMapper;

    RealGeminiClient(GeminiApi geminiApi, ObjectMapper objectMapper) {
        this.geminiApi = geminiApi;
        this.objectMapper = objectMapper;
    }

    @Override
    public AnalysisContent generate(String type, List<GeminiImage> images) {
        // WORD 전용 — 빠른 모델 우선(fast=true)에 responseSchema로 필드 누락(example·exampleMeaning)을 강제 차단(#369).
        String raw = geminiApi.generate(WORD_PROMPT, images, true, true, WORD_SCHEMA);
        JsonNode node = readJson(raw);
        String word = str(node, "word", null);
        String example = str(node, "example", null);
        String exampleMeaning = str(node, "exampleMeaning", null);
        // 잔여 보정(#399) — 스키마를 걸어도 드물게 예문이 비거나(빈 문자열), 옛 캐시가 null을 물고 있는 경우가 있다.
        // 둘 중 하나라도 비면 flash로 예문·한글번역을 보정해 항상 채운다(원인 불문). 예문이 있으면 그 문장을 그대로 번역해 정합을 지킨다.
        if (isBlank(example) || isBlank(exampleMeaning)) {
            String[] pair = examplePair(word, example);
            example = isBlank(example) ? pair[0] : example;
            exampleMeaning = isBlank(exampleMeaning) ? pair[1] : exampleMeaning;
        }
        return new AnalysisContent(
                MODEL, str(node, "subject", "ENGLISH"),
                word, str(node, "contextMeaning", null),
                str(node, "dictMeaning", null), example, exampleMeaning,
                str(node, "pronunciation", null), str(node, "pos", null), strList(node, "tags"), str(node, "emoji", null),
                null);   // concept 미채움
    }

    /**
     * 예문·한글번역 보정 쌍(#399). existingExample이 있으면 그 문장을 그대로 한국어로 번역해 [예문, 번역]을 돌려주고(정합 유지),
     * 없으면 단어로 새 예문+번역을 한 번에 생성한다(responseSchema로 두 필드 강제). flash 체인(fast=false)으로 안정성 우선.
     */
    private String[] examplePair(String word, String existingExample) {
        if (!isBlank(existingExample)) {
            String prompt = "다음 영어 문장의 자연스러운 한국어 번역만 출력하라(따옴표·설명 없이):\n" + existingExample;
            return new String[]{existingExample, geminiApi.generate(prompt, List.of(), false).strip()};
        }
        String prompt = "영어 단어 또는 숙어 '" + word + "'를 자연스럽게 포함한 새 영어 예문 한 문장과 그 한국어 번역을 "
                + "아래 JSON만 출력하라(코드블록·설명 없이). {\"example\":\"영어 예문 한 문장\",\"exampleMeaning\":\"위 예문의 한국어 번역\"}";
        JsonNode node = readJson(geminiApi.generate(prompt, List.of(), true, false, PAIR_SCHEMA));
        return new String[]{str(node, "example", null), str(node, "exampleMeaning", null)};
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    @Override
    public String generateExample(String word) {
        String prompt = "영어 단어 또는 숙어 '" + word + "'를 자연스럽게 포함한 새 영어 예문 한 문장만 출력하라. "
                + "다른 말·따옴표 없이 예문 문장만.";
        return geminiApi.generate(prompt, List.of(), false).strip();
    }

    @Override
    public String generateMnemonicImage(String word, String meaning) {
        String prompt = "영어 단어 '" + word + "'"
                + (meaning == null || meaning.isBlank() ? "" : "(뜻: " + meaning + ")")
                + "의 의미를 기억하기 좋은 연상 일러스트를 그려라. 밝고 단순한 그림체, 글자·텍스트 없이 이미지만.";
        return geminiApi.generateImageDataUrl(prompt);
    }

    private JsonNode readJson(String raw) {
        try {
            return objectMapper.readTree(stripFences(raw));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Gemini 분석 JSON 파싱 실패: " + raw, e);
        }
    }

    /** 모델이 드물게 감싸는 ```json 코드펜스를 방어적으로 벗긴다(responseMimeType이면 보통 순수 JSON). */
    private static String stripFences(String raw) {
        String s = raw.strip();
        if (s.startsWith("```")) {
            s = s.replaceFirst("^```(json)?", "").replaceFirst("```$", "").strip();
        }
        return s;
    }

    private static String str(JsonNode node, String field, String fallback) {
        return node.hasNonNull(field) ? node.get(field).asText() : fallback;
    }

    /** JSON 배열 필드를 문자열 리스트로 — 없거나 배열이 아니면 null(카드 tags 미설정). */
    private static List<String> strList(JsonNode node, String field) {
        if (!node.hasNonNull(field) || !node.get(field).isArray()) {
            return null;
        }
        List<String> list = new java.util.ArrayList<>();
        node.get(field).forEach(element -> list.add(element.asText()));
        return list;
    }
}
