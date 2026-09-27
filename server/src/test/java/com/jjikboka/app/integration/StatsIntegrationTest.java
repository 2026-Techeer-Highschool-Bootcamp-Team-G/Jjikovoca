package com.jjikboka.app.integration;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * FR-9 학습 리포트 · FR-13 경험치 · FR-14 출석·잔디 인수조건 (#470, P1-9).
 * <ul>
 *   <li>FR-13: Given 정답 활동, When 경험치 지급, Then 일일 한도(100) 내에서 갱신되고 초과분은 차단</li>
 *   <li>FR-14: 출석 이중 계산 방지 · Given 학습한 날, When 잔디 조회, Then 그날 칸이 색칠된다</li>
 *   <li>FR-9: Given 이번 달 학습 로그, When 리포트 조회, Then 학습 통계를 표시</li>
 * </ul>
 */
class StatsIntegrationTest extends IntegrationTestSupport {

    private static final int DAILY_CAP = 100;

    @Test
    void 출석은_하루_한번만_적립되고_재호출은_0이다() throws Exception {
        String token = register("fr14-attend@test.com");

        JsonNode first = attend(token);
        assertThat(first.get("earned").asInt()).isPositive();
        assertThat(first.get("streakDays").asInt()).isEqualTo(1);

        JsonNode second = attend(token);
        assertThat(second.get("earned").asInt()).isZero();
        assertThat(second.get("total").asInt()).isEqualTo(first.get("total").asInt());
        assertThat(second.get("streakDays").asInt()).isEqualTo(1);
    }

    @Test
    void 하루_적립_경험치는_한도_100을_넘지_않고_초과분은_0으로_차단된다() throws Exception {
        String token = register("fr13-cap@test.com");
        List<Long> cardIds = seedCards(token, 10);

        // 빈칸 정답 10연속 = 10 + 15×9 = 145 → 캡처 적립과 합쳐 한도를 확실히 넘긴다.
        int lastEarned = -1;
        for (long cardId : cardIds) {
            String word = data(mockMvc.perform(get("/api/cards/" + cardId).header("Authorization", bearer(token)))
                    .andExpect(status().isOk()).andReturn()).get("word").asText();
            JsonNode answer = data(mockMvc.perform(post("/api/study/cloze/" + cardId + "/answer")
                            .header("Authorization", bearer(token)).contentType(APPLICATION_JSON)
                            .content(json(Map.of("guess", word, "durationMs", 1000))))
                    .andExpect(status().isOk()).andReturn());
            assertThat(answer.get("correct").asBoolean()).isTrue();
            lastEarned = answer.get("exp").get("earned").asInt();
        }

        JsonNode summary = expSummary(token);
        assertThat(summary.get("dailyCap").asInt()).isEqualTo(DAILY_CAP);
        assertThat(summary.get("todayEarned").asInt()).isEqualTo(DAILY_CAP);
        assertThat(lastEarned).as("한도에 도달한 뒤의 정답은 적립되지 않는다").isZero();
        // 한도에 걸린 날은 출석도 경험치 없이 기록만 된다.
        assertThat(attend(token).get("earned").asInt()).isZero();
    }

    @Test
    void 학습하면_리포트_지표와_오늘_잔디에_반영된다() throws Exception {
        String token = register("fr9-report@test.com");
        List<Long> cardIds = seedCards(token, 3);

        study(token, cardIds.get(0), "KNOW");
        study(token, cardIds.get(1), "KNOW");
        study(token, cardIds.get(2), "DONT_KNOW");

        JsonNode report = data(mockMvc.perform(get("/api/reports/summary").header("Authorization", bearer(token)))
                .andExpect(status().isOk()).andReturn());
        JsonNode basic = report.get("basic");
        assertThat(basic.get("newCards").asLong()).isEqualTo(3);
        assertThat(basic.get("studyCount").asLong()).isEqualTo(3);
        assertThat(basic.get("accuracy").get("word").isNumber()).isTrue();

        JsonNode today = null;
        for (JsonNode day : report.get("grass")) {
            if (LocalDate.now().toString().equals(day.get("date").asText())) {
                today = day;
            }
        }
        assertThat(today).as("오늘 날짜의 잔디 칸이 있어야 한다").isNotNull();
        assertThat(today.get("count").asLong()).isGreaterThanOrEqualTo(3);
        assertThat(today.get("level").asInt()).isPositive();
    }

    private JsonNode attend(String token) throws Exception {
        return data(mockMvc.perform(post("/api/exp/attend").header("Authorization", bearer(token)))
                .andExpect(status().isOk()).andReturn());
    }

    private JsonNode expSummary(String token) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/exp/summary").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andReturn();
        return data(result);
    }

    private void study(String token, long cardId, String result) throws Exception {
        mockMvc.perform(post("/api/cards/" + cardId + "/study").header("Authorization", bearer(token))
                        .contentType(APPLICATION_JSON)
                        .content(json(Map.of("activity", "FLASHCARD", "result", result, "durationMs", 60_000))))
                .andExpect(status().isOk());
    }
}
