package com.jjikboka.integration;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * FR-6 예문 빈칸 채우기 퀴즈 인수조건 (#470, P1-9).
 * <ul>
 *   <li>치팅 방지: 문항에는 정답 단어가 없고(빈칸 처리), 정답은 판정 응답에서만 공개된다</li>
 *   <li>Given 답 제출, When 서버 판정, Then 판정 결과가 study_log에 기록되고 Leitner 스케줄이 갱신된다</li>
 * </ul>
 * 현행 구현은 판정 결과를 그대로 기록한다(정답=KNOW·오답=DONT_KNOW). FR-6이 요구하는 판정 후 사용자 자기평가(알/헷/몰)
 * 단계는 구현이 없어 FR 원장에 갭으로 기록한다. 정답 단어는 mock AI 응답에서 읽는다({@code cardWord}) — 하드코딩하지 않는다.
 */
class ClozeIntegrationTest extends IntegrationTestSupport {

    @Test
    void 문항의_예문과_응답_필드_어디에도_정답_단어가_노출되지_않는다() throws Exception {
        String token = register("fr6-hidden@test.com");
        long cardId = seedCards(token, 1).get(0);
        String word = cardWord(token, cardId);

        JsonNode item = clozeItem(token, cardId);

        assertThat(item.get("clozeText").asText().toLowerCase()).doesNotContain(word.toLowerCase());
        assertThat(item.has("word")).isFalse();
    }

    @Test
    void 정답을_내면_단어가_공개되고_box가_올라가며_학습기록이_남는다() throws Exception {
        String token = register("fr6-correct@test.com");
        long cardId = seedCards(token, 1).get(0);
        String word = cardWord(token, cardId);

        answer(token, cardId, word)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.correct").value(true))
                .andExpect(jsonPath("$.data.word").value(word))
                .andExpect(jsonPath("$.data.boxLevel").value(1));

        assertThat(studyCount(token)).isEqualTo(1);
    }

    @Test
    void 오답을_내면_정답과_뜻을_보여주고_box0과_콤보0으로_돌아가며_학습기록이_남는다() throws Exception {
        String token = register("fr6-wrong@test.com");
        long cardId = seedCards(token, 1).get(0);
        String word = cardWord(token, cardId);
        // 먼저 맞혀 box 1·콤보 1로 올려 둬야, 오답이 실제로 둘을 되돌리는지 확인할 수 있다.
        answer(token, cardId, word)
                .andExpect(jsonPath("$.data.boxLevel").value(1))
                .andExpect(jsonPath("$.data.combo").value(1));

        answer(token, cardId, "definitely-not-the-word")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.correct").value(false))
                .andExpect(jsonPath("$.data.word").value(word))
                .andExpect(jsonPath("$.data.meaning").isNotEmpty())
                .andExpect(jsonPath("$.data.boxLevel").value(0))
                .andExpect(jsonPath("$.data.combo").value(0));

        assertThat(studyCount(token)).isEqualTo(2);
    }

    @Test
    void 판정은_대소문자와_앞뒤_공백을_무시한다() throws Exception {
        String token = register("fr6-normalize@test.com");
        long cardId = seedCards(token, 1).get(0);
        String word = cardWord(token, cardId);

        answer(token, cardId, "  " + word.toUpperCase() + " ")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.correct").value(true));
    }

    @Test
    void 연속으로_맞히면_콤보가_쌓인다() throws Exception {
        String token = register("fr6-combo@test.com");
        var cardIds = seedCards(token, 2);

        answer(token, cardIds.get(0), cardWord(token, cardIds.get(0)))
                .andExpect(jsonPath("$.data.combo").value(1));
        answer(token, cardIds.get(1), cardWord(token, cardIds.get(1)))
                .andExpect(jsonPath("$.data.combo").value(2));
    }

    @Test
    void 답을_비워_제출하면_400_MISSING_GUESS다() throws Exception {
        String token = register("fr6-blank@test.com");
        long cardId = seedCards(token, 1).get(0);

        answer(token, cardId, " ")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorName").value("MISSING_GUESS"));
    }

    @Test
    void 남의_카드_문항에_답하면_403이다() throws Exception {
        long othersCard = seedCards(register("fr6-owner@test.com"), 1).get(0);
        String intruder = register("fr6-intruder@test.com");

        answer(intruder, othersCard, "anything").andExpect(status().isForbidden());
    }

    private JsonNode clozeItem(String token, long cardId) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/study/cloze")
                        .param("cardIds", String.valueOf(cardId)).header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode items = data(result).get("items");
        assertThat(items).as("mock 카드에는 예문이 있어 빈칸 문항이 만들어져야 한다").isNotEmpty();
        return items.get(0);
    }

    private ResultActions answer(String token, long cardId, String guess) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("guess", guess);
        body.put("durationMs", 1500);
        return mockMvc.perform(post("/api/study/cloze/" + cardId + "/answer")
                .header("Authorization", bearer(token)).contentType(APPLICATION_JSON).content(json(body)));
    }

    private int studyCount(String token) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/reports/summary").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andReturn();
        return data(result).get("basic").get("studyCount").asInt();
    }
}
