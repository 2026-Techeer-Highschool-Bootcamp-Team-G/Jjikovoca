package com.jjikboka.analysis;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;

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
              "pronunciation": "IPA 발음기호 (예: /saʊnd/)",
              "pos": "품사(한국어, 예: 명사/동사/형용사/부사)",
              "tags": ["유형 태그 2~4개(예: 수능, 빈출, 동사)"],
              "emoji": "단어를 상징하는 이모지 1개"
            }
            """;

    private static final String PROBLEM_PROMPT = """
            다음은 수학 문제의 크롭 이미지다. 문제를 분석해 아래 JSON만 출력하라(코드블록·설명 없이).
            {
              "subject": "MATH",
              "summary": "문제 한 줄 요약(한국어)",
              "latex": "문제 수식(LaTeX)",
              "concept": "핵심 개념(한국어)",
              "hint1": "1단계 힌트", "hint2": "2단계 힌트", "hint3": "3단계 힌트",
              "answerFormat": "NUMERIC | EXPRESSION | CHOICE 중 하나",
              "solutions": [{"label": "풀이명", "steps": [{"no": 1, "title": "1단계", "question": "질문", "content": "내용"}], "explanation": "해설"}],
              "answerValue": "정답 값(문자열)",
              "diagnosis": {"failedStep": 1, "description": "자주 틀리는 지점", "suggestedReason": "MISTAKE | CONCEPT"}
            }
            """;

    private final GeminiApi geminiApi;
    private final ObjectMapper objectMapper;

    RealGeminiClient(GeminiApi geminiApi, ObjectMapper objectMapper) {
        this.geminiApi = geminiApi;
        this.objectMapper = objectMapper;
    }

    @Override
    public AnalysisContent generate(String type, List<GeminiImage> images) {
        boolean problem = "PROBLEM".equals(type);
        String raw = geminiApi.generate(problem ? PROBLEM_PROMPT : WORD_PROMPT, images, true);
        JsonNode node = readJson(raw);
        if (problem) {
            return new AnalysisContent(
                    MODEL, str(node, "subject", "MATH"),
                    null, null, null, null,
                    null, null, null, null,   // WORD enrichment 미해당(PROBLEM)
                    str(node, "summary", null), str(node, "latex", null), str(node, "concept", null),
                    str(node, "hint1", null), str(node, "hint2", null), str(node, "hint3", null),
                    str(node, "answerFormat", null),
                    jsonString(node, "solutions"), str(node, "answerValue", null), jsonString(node, "diagnosis"));
        }
        return new AnalysisContent(
                MODEL, str(node, "subject", "ENGLISH"),
                str(node, "word", null), str(node, "contextMeaning", null),
                str(node, "dictMeaning", null), str(node, "example", null),
                str(node, "pronunciation", null), str(node, "pos", null), strList(node, "tags"), str(node, "emoji", null),
                null, null, null, null, null, null, null, null, null, null);
    }

    @Override
    public String generateExample(String word) {
        String prompt = "영어 단어 또는 숙어 '" + word + "'를 자연스럽게 포함한 새 영어 예문 한 문장만 출력하라. "
                + "다른 말·따옴표 없이 예문 문장만.";
        return geminiApi.generate(prompt, List.of(), false).strip();
    }

    @Override
    public String generateSolutionJson(String latex) {
        String prompt = "다음 수식의 문제에 대해 기존과 다른 접근의 풀이를 아래 JSON만으로 출력하라(코드블록·설명 없이). "
                + "{\"label\": \"풀이명\", \"steps\": [{\"no\": 1, \"title\": \"1단계\", \"question\": \"질문\", \"content\": \"내용\"}], "
                + "\"explanation\": \"해설\"}\n수식: " + latex;
        return geminiApi.generate(prompt, List.of(), true).strip();
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

    private String jsonString(JsonNode node, String field) {
        if (!node.hasNonNull(field)) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(node.get(field));
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}
