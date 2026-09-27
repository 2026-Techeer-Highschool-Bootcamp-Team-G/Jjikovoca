package com.jjikboka.app.integration;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

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
        MvcResult accepted = submitAnalyze(token, 1)
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
}
