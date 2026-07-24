package com.jjikboka.app.integration;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 핵심 흐름 회귀 테스트 (실 MySQL·Redis). 빌드·ArchUnit·부팅 스모크로는 못 잡는 런타임/쿼리 결함을 잡는 안전망이다.
 * 특히 리포트(17)는 #160(accuracyByType Object[] 이중 래핑 → ClassCastException)이 재발하면 여기서 바로 빨간불이 된다.
 */
class CoreFlowIntegrationTest extends IntegrationTestSupport {

    // 1x1 PNG data URL — 접수 검증(비어있지 않은 base64)을 통과한다.
    private static final String IMAGE =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

    @Test
    void 리포트는_학습데이터가_없어도_200이다() throws Exception {
        // #160 회귀 가드: accuracyByType이 SUM=null(집계 대상 0)일 때도 캐스팅 없이 리포트가 나와야 한다.
        String token = register("report-empty@test.com");

        mockMvc.perform(get("/api/reports/summary").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.basic.studyCount").value(0))
                .andExpect(jsonPath("$.data.basic.accuracy.word").doesNotExist())
                .andExpect(jsonPath("$.data.grass").isArray());
    }

    @Test
    void 가입부터_분석_학습_리포트까지_핵심흐름이_돈다() throws Exception {
        String token = register("core-flow@test.com");

        // 캡처 분석 접수(mock) → 202 + jobId
        String analyzeBody = objectMapper.writeValueAsString(Map.of(
                "type", "WORD", "cropImages", new String[]{IMAGE}, "fullImage", IMAGE));
        MvcResult accepted = mockMvc.perform(post("/api/cards/analyze")
                        .header("Authorization", bearer(token)).contentType(APPLICATION_JSON).content(analyzeBody))
                .andExpect(status().isAccepted())
                .andReturn();
        long jobId = data(accepted).get("jobId").asLong();

        // 워커가 AFTER_COMMIT 비동기라 폴링으로 완료를 기다린다(mock은 즉시 끝난다).
        awaitJobCompleted(token, jobId);

        // 피드에 WORD 카드가 생겼다.
        MvcResult feed = mockMvc.perform(get("/api/cards").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode cards = data(feed).get("cards");
        assertThat(cards).isNotEmpty();
        long cardId = cards.get(0).get("id").asLong();

        // 학습 기록(KNOW) → 200.
        String studyBody = objectMapper.writeValueAsString(Map.of(
                "activity", "FLASHCARD", "result", "KNOW", "durationMs", 1200));
        mockMvc.perform(post("/api/cards/" + cardId + "/study")
                        .header("Authorization", bearer(token)).contentType(APPLICATION_JSON).content(studyBody))
                .andExpect(status().isOk());

        // 리포트에 학습 1건이 반영된다(집계 쿼리 실동작 — #160 가드 겸 흐름 검증).
        mockMvc.perform(get("/api/reports/summary").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.basic.newCards").value(1))
                .andExpect(jsonPath("$.data.basic.studyCount").value(1));
    }

    /** 회원가입 후 accessToken을 돌려준다. */
    private String register(String email) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "email", email, "password", "pass1234!", "nickname", "테스터"));
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andReturn();
        return data(result).get("accessToken").asText();
    }

    /** 분석 작업이 COMPLETED가 될 때까지 짧게 폴링한다(최대 ~5초). */
    private void awaitJobCompleted(String token, long jobId) throws Exception {
        for (int attempt = 0; attempt < 50; attempt++) {
            MvcResult poll = mockMvc.perform(get("/api/cards/analyze/" + jobId)
                            .header("Authorization", bearer(token)))
                    .andExpect(status().isOk())
                    .andReturn();
            String jobStatus = data(poll).get("status").asText();
            if ("COMPLETED".equals(jobStatus)) {
                return;
            }
            if ("FAILED".equals(jobStatus)) {
                throw new AssertionError("분석 작업이 실패했다: jobId=" + jobId);
            }
            Thread.sleep(100);
        }
        throw new AssertionError("분석 작업이 제한시간 내 완료되지 않았다: jobId=" + jobId);
    }

    private JsonNode data(MvcResult result) throws Exception {
        String json = result.getResponse().getContentAsString(StandardCharsets.UTF_8);
        return objectMapper.readTree(json).get("data");
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
