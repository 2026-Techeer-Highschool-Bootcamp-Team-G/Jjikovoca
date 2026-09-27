package com.jjikboka.app.integration;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * FR-5 플래시카드 · FR-10 복습 큐 · FR-12 학습 진입 인수조건 (#470, P1-9).
 * <ul>
 *   <li>FR-5: Given 복습 카드, When 몰라요 선택, Then 짧은 간격으로 재출제되도록 스케줄 갱신 · 알아요 4회 시 졸업</li>
 *   <li>FR-10/12: Given 단어 N개 직접 선택, When 선택 복습(PICK), Then 선택된 단어만으로 큐가 생성된다</li>
 * </ul>
 * 스케줄은 Leitner box(0~4) 단일 경로다(요구사항 v3.2, FSRS 제거). 태그 기반·오답률 정렬 모드는 아직 구현이 없어
 * 여기서 검증하지 않고 FR 원장에 갭으로 기록한다.
 */
class StudyIntegrationTest extends IntegrationTestSupport {

    @Test
    void 몰라요를_고르면_box0으로_돌아가고_다음날_재출제되며_오늘_복습큐에서_빠진다() throws Exception {
        String token = register("fr5-dontknow@test.com");
        long cardId = seedCards(token, 1).get(0);
        study(token, cardId, "KNOW").andExpect(status().isOk());   // box 1 — 리셋이 실제로 일어나는지 보려고 먼저 올린다
        LocalDate before = LocalDate.now();

        JsonNode result = data(study(token, cardId, "DONT_KNOW").andExpect(status().isOk()).andReturn());

        assertThat(result.get("boxLevel").asInt()).isZero();
        assertThat(result.get("graduated").asBoolean()).isFalse();
        assertTodayPlus(nextReviewDate(result), before, 1);
        // 다음 복습 시각이 미래라 오늘의 복습 큐에서는 빠진다.
        assertThat(reviewQueueIds(token)).doesNotContain(cardId);
    }

    @Test
    void 헷갈려요는_box를_유지하고_간격과_무관하게_다음날_재출제된다() throws Exception {
        String token = register("fr5-confused@test.com");
        long cardId = seedCards(token, 1).get(0);
        study(token, cardId, "KNOW").andExpect(status().isOk());
        study(token, cardId, "KNOW").andExpect(status().isOk());   // box 2 — 원래 간격은 +3일
        LocalDate before = LocalDate.now();

        JsonNode result = data(study(token, cardId, "CONFUSED").andExpect(status().isOk()).andReturn());

        assertThat(result.get("boxLevel").asInt()).isEqualTo(2);
        assertTodayPlus(nextReviewDate(result), before, 1);
    }

    @Test
    void 알아요를_4번_고르면_box4로_졸업하고_복습큐에_다시_나오지_않는다() throws Exception {
        String token = register("fr5-graduate@test.com");
        long cardId = seedCards(token, 1).get(0);

        for (int box = 1; box <= 4; box++) {
            JsonNode result = data(study(token, cardId, "KNOW").andExpect(status().isOk()).andReturn());
            assertThat(result.get("boxLevel").asInt()).isEqualTo(box);
            // 졸업은 box 4에서만 — 그 전에 졸업하면 조기 졸업 회귀다.
            assertThat(result.get("graduated").asBoolean()).isEqualTo(box == 4);
        }

        assertThat(reviewQueueIds(token)).doesNotContain(cardId);
    }

    @Test
    void 새로_만든_카드는_오늘_복습큐와_기본_플래시카드_큐에_모두_들어간다() throws Exception {
        String token = register("fr12-today@test.com");
        List<Long> cardIds = seedCards(token, 3);

        assertThat(reviewQueueIds(token)).containsExactlyInAnyOrderElementsOf(cardIds);
        assertThat(flashcardIds(token, "TODAY", null)).containsExactlyInAnyOrderElementsOf(cardIds);
    }

    @Test
    void 선택_복습은_직접_고른_단어만으로_큐를_만든다() throws Exception {
        String token = register("fr10-pick@test.com");
        List<Long> cardIds = seedCards(token, 5);
        List<Long> picked = cardIds.subList(0, 2);

        assertThat(flashcardIds(token, "PICK", picked)).containsExactlyInAnyOrderElementsOf(picked);
    }

    @Test
    void 선택_복습에서_아무것도_고르지_않으면_빈_큐가_나온다() throws Exception {
        String token = register("fr10-pick-empty@test.com");
        seedCards(token, 2);

        assertThat(flashcardIds(token, "PICK", null)).isEmpty();
    }

    @Test
    void 선택_복습에_남의_카드_id를_섞어도_내_카드만_나온다() throws Exception {
        String owner = register("fr10-owner@test.com");
        long othersCard = seedCards(owner, 1).get(0);
        String me = register("fr10-me@test.com");
        long myCard = seedCards(me, 1).get(0);

        assertThat(flashcardIds(me, "PICK", List.of(myCard, othersCard))).containsExactly(myCard);
    }

    @Test
    void 남의_카드에_학습기록을_남기면_403이다() throws Exception {
        long othersCard = seedCards(register("fr5-owner@test.com"), 1).get(0);
        String intruder = register("fr5-intruder@test.com");

        study(intruder, othersCard, "KNOW")
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorName").value("FORBIDDEN"));
    }

    @Test
    void 허용되지_않는_평가값은_400_INVALID_STUDY_RESULT다() throws Exception {
        String token = register("fr5-invalid@test.com");
        long cardId = seedCards(token, 1).get(0);

        study(token, cardId, "MAYBE")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorName").value("INVALID_STUDY_RESULT"));
    }

    private ResultActions study(String token, long cardId, String result) throws Exception {
        return mockMvc.perform(post("/api/cards/" + cardId + "/study")
                .header("Authorization", bearer(token)).contentType(APPLICATION_JSON)
                .content(json(Map.of("activity", "FLASHCARD", "result", result, "durationMs", 1000))));
    }

    private List<Long> reviewQueueIds(String token) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/study/review-queue").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andReturn();
        return ids(data(result).get("cards"));
    }

    private List<Long> flashcardIds(String token, String mode, List<Long> cardIds) throws Exception {
        var request = get("/api/study/flashcards").param("mode", mode).header("Authorization", bearer(token));
        if (cardIds != null) {
            cardIds.forEach(id -> request.param("cardIds", String.valueOf(id)));
        }
        MvcResult result = mockMvc.perform(request).andExpect(status().isOk()).andReturn();
        return ids(data(result).get("cards"));
    }

    private static LocalDate nextReviewDate(JsonNode studyResult) {
        return LocalDateTime.parse(studyResult.get("nextReviewAt").asText()).toLocalDate();
    }
}
