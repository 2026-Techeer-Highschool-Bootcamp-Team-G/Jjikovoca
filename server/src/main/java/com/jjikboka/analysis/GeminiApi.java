package com.jjikboka.analysis;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Gemini generateContent 저수준 호출 (API-6). REST 계약: {@code POST /models/{model}:generateContent},
 * 헤더 {@code x-goog-api-key}, 본문 {@code contents[].parts[]}(text·inline_data), 응답 {@code candidates[0].content.parts[0].text}.
 *
 * <p><b>모델 폴백 체인</b>: 설정 목록을 앞에서부터 시도하고, 호출·파싱 실패면 다음 모델로 넘어간다.
 * 전부 실패하면 예외 — 워커가 이를 받아 job을 FAILED로 두고 quota를 환불한다(13 §6).
 * base64 인코딩은 여기서 한다(비전 입력 inline_data.data). 실 호출 슬라이스 밖으로 노출하지 않으려 package-private.
 */
@Component
class GeminiApi {

    private static final Logger log = LoggerFactory.getLogger(GeminiApi.class);

    private final WebClient webClient;
    private final GeminiProperties properties;
    private final ObjectMapper objectMapper;

    GeminiApi(WebClient geminiWebClient, GeminiProperties properties, ObjectMapper objectMapper) {
        this.webClient = geminiWebClient;
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    /**
     * 프롬프트(+비전 이미지)를 보내고 응답 텍스트를 돌려준다. jsonOutput이면 responseMimeType을 application/json으로 강제해
     * 모델이 순수 JSON만 내도록 한다. 모델 폴백을 모두 소진하면 마지막 오류를 담아 예외를 던진다.
     */
    String generate(String prompt, List<GeminiImage> images, boolean jsonOutput) {
        Map<String, Object> body = buildBody(prompt, images, jsonOutput);
        RuntimeException last = null;
        for (String model : properties.getModels()) {
            try {
                String raw = call(model, body);
                return extractText(raw);
            } catch (RuntimeException e) {
                log.warn("Gemini 모델 실패 — model={}, 다음 후보로 폴백: {}", model, e.getMessage());
                last = e;
            }
        }
        throw new IllegalStateException("모든 Gemini 모델 호출 실패", last);
    }

    private String call(String model, Map<String, Object> body) {
        return webClient.post()
                .uri("/models/{model}:generateContent", model)
                .header("x-goog-api-key", properties.getApiKey())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(properties.getTimeoutMs()))
                .block();
    }

    /** contents[0].parts = [text, inline_data...]. jsonOutput이면 generationConfig.responseMimeType 지정. */
    private Map<String, Object> buildBody(String prompt, List<GeminiImage> images, boolean jsonOutput) {
        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(Map.of("text", prompt));
        if (images != null) {
            for (GeminiImage image : images) {
                parts.add(Map.of("inline_data", Map.of(
                        "mime_type", image.mimeType(),
                        "data", Base64.getEncoder().encodeToString(image.data()))));
            }
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("contents", List.of(Map.of("parts", parts)));
        if (jsonOutput) {
            body.put("generationConfig", Map.of("responseMimeType", "application/json"));
        }
        return body;
    }

    /** candidates[0].content.parts[0].text를 뽑는다. 후보·파트가 없으면 예외(→ 폴백). */
    private String extractText(String raw) {
        try {
            JsonNode root = objectMapper.readTree(raw);
            JsonNode text = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
            if (text.isMissingNode() || !text.isTextual()) {
                throw new IllegalStateException("Gemini 응답에 텍스트가 없음: " + raw);
            }
            return text.asText();
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new IllegalStateException("Gemini 응답 파싱 실패", e);
        }
    }
}
