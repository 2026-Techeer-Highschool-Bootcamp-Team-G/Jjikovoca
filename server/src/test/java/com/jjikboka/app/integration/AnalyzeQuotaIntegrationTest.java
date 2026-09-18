package com.jjikboka.app.integration;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 분석 접수 쿼터 경로 회귀 테스트 (P1-4, 결함 P0-02 가드). 시현용 demo 하드캡(총 3회)·이메일 우회를 제거한 뒤,
 * 무료 사용자의 유일한 제한이 일일 쿼터(free 5)임을 검증한다.
 * 옛 하드캡이 되살아나면 4회째 접수부터 EXTRACT_LIMIT_REACHED(429)로 여기서 바로 빨간불이 된다.
 */
class AnalyzeQuotaIntegrationTest extends IntegrationTestSupport {

    // 1x1 PNG data URL — 접수 검증(비어있지 않은 base64)을 통과한다.
    private static final String IMAGE =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

    @Test
    void 무료사용자는_옛_demo캡3을_넘겨_일일한도5까지_접수하고_초과는_QUOTA_EXCEEDED다() throws Exception {
        String token = register("quota-path@test.com");

        // 옛 demo 하드캡(3회)이 제거됐으므로 무료 일일 한도(5)까지 모두 접수(202)된다.
        for (int i = 1; i <= 5; i++) {
            submitAnalyze(token).andExpect(status().isAccepted());
        }

        // 6회째는 일일 쿼터 초과 — demo 캡(EXTRACT_LIMIT_REACHED)이 아니라 QUOTA_EXCEEDED여야 한다.
        submitAnalyze(token)
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorName").value("QUOTA_EXCEEDED"));
    }

    private ResultActions submitAnalyze(String token) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "type", "WORD", "cropImages", new String[]{IMAGE}, "fullImage", IMAGE));
        return mockMvc.perform(post("/api/cards/analyze")
                .header("Authorization", "Bearer " + token).contentType(APPLICATION_JSON).content(body));
    }

    private String register(String email) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "email", email, "password", "pass1234!", "nickname", "테스터"));
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andReturn();
        String json = result.getResponse().getContentAsString(StandardCharsets.UTF_8);
        return objectMapper.readTree(json).get("data").get("accessToken").asText();
    }
}
