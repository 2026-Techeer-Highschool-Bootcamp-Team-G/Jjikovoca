package com.jjikboka.app.integration;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.oneOf;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * FR-11 시험 등록 및 수동 시험 태깅 인수조건 (#470, P1-9).
 * <ul>
 *   <li>Given 단어 상세, When 사용자가 시험 태그를 수동 변경, Then 변경 사항이 즉시 카드에 반영된다</li>
 *   <li>예외: 한 단어에 여러 시험 태그(다대다) · 시험 삭제 시 카드의 태그만 해제되고 단어는 보존</li>
 * </ul>
 * FR-11의 "활성 시험 지정 시 촬영 카드 자동 태깅"은 구현이 없어 여기서 검증하지 않고 FR 원장에 갭으로 기록한다.
 */
class ExamIntegrationTest extends IntegrationTestSupport {

    @Test
    void 시험을_등록하면_D_day가_계산되어_목록에_나온다() throws Exception {
        String token = register("fr11-create@test.com");
        LocalDate examDate = LocalDate.now().plusDays(10);

        JsonNode exam = data(createExam(token, "중간고사", examDate).andExpect(status().isOk()).andReturn());

        // 요청이 자정을 넘기면 서버의 "오늘"이 하루 뒤라 D-9가 된다 — 둘 다 올바른 계산이다.
        assertThat(exam.get("dday").asLong()).isIn(10L, 9L);
        assertThat(examTitles(token)).containsExactly("중간고사");
    }

    @Test
    void 시험_날짜_형식이_틀리면_400_INVALID_EXAM_DATE다() throws Exception {
        String token = register("fr11-baddate@test.com");

        mockMvc.perform(post("/api/exams").header("Authorization", bearer(token)).contentType(APPLICATION_JSON)
                        .content(json(Map.of("title", "기말고사", "subject", "ENGLISH", "examDate", "2026/12/01"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorName").value("INVALID_EXAM_DATE"));
    }

    @Test
    void 시험_이름과_날짜를_수정할_수_있다() throws Exception {
        String token = register("fr11-update@test.com");
        long examId = examId(createExam(token, "모의고사", LocalDate.now().plusDays(5)));

        mockMvc.perform(patch("/api/exams/" + examId).header("Authorization", bearer(token))
                        .contentType(APPLICATION_JSON)
                        .content(json(Map.of("title", "3월 모의고사", "examDate", LocalDate.now().plusDays(7).toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("3월 모의고사"))
                .andExpect(jsonPath("$.data.dday").value(oneOf(7, 6)));
    }

    @Test
    void 카드에_여러_시험_태그를_붙이면_시험별_피드에_나오고_하나를_해제하면_그_시험에서만_빠진다() throws Exception {
        String token = register("fr11-tag@test.com");
        long cardId = seedCards(token, 1).get(0);
        long midterm = examId(createExam(token, "중간고사", LocalDate.now().plusDays(10)));
        long mock = examId(createExam(token, "모의고사", LocalDate.now().plusDays(20)));

        JsonNode tagged = data(tag(token, cardId, List.of(midterm, mock)).andExpect(status().isOk()).andReturn());
        assertThat(tagIds(tagged)).containsExactlyInAnyOrder(midterm, mock);
        assertThat(feedIds(token, "examId", midterm)).containsExactly(cardId);
        assertThat(feedIds(token, "examId", mock)).containsExactly(cardId);

        mockMvc.perform(delete("/api/cards/" + cardId + "/exams/" + mock).header("Authorization", bearer(token)))
                .andExpect(status().isOk());

        assertThat(feedIds(token, "examId", mock)).isEmpty();
        assertThat(feedIds(token, "examId", midterm)).containsExactly(cardId);
    }

    @Test
    void 시험을_삭제해도_태그된_카드는_보존된다() throws Exception {
        String token = register("fr11-delete@test.com");
        long cardId = seedCards(token, 1).get(0);
        long examId = examId(createExam(token, "기말고사", LocalDate.now().plusDays(30)));
        tag(token, cardId, List.of(examId)).andExpect(status().isOk());

        mockMvc.perform(delete("/api/exams/" + examId).header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.deletedId").value(examId));

        assertThat(examTitles(token)).isEmpty();
        // 단어는 보존되고, 태그만 풀려 미분류(untagged) 피드로 돌아간다.
        mockMvc.perform(get("/api/cards/" + cardId).header("Authorization", bearer(token)))
                .andExpect(status().isOk());
        assertThat(feedIds(token, "untagged", true)).containsExactly(cardId);
    }

    @Test
    void 남의_시험은_수정하거나_남의_시험으로_태그할_수_없다() throws Exception {
        String owner = register("fr11-owner@test.com");
        long othersExam = examId(createExam(owner, "남의 시험", LocalDate.now().plusDays(3)));
        String me = register("fr11-me@test.com");
        long myCard = seedCards(me, 1).get(0);

        mockMvc.perform(patch("/api/exams/" + othersExam).header("Authorization", bearer(me))
                        .contentType(APPLICATION_JSON).content(json(Map.of("title", "탈취"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorName").value("FORBIDDEN"));
        tag(me, myCard, List.of(othersExam))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorName").value("FORBIDDEN"));
    }

    private ResultActions createExam(String token, String title, LocalDate examDate) throws Exception {
        return mockMvc.perform(post("/api/exams").header("Authorization", bearer(token)).contentType(APPLICATION_JSON)
                .content(json(Map.of("title", title, "subject", "ENGLISH", "examDate", examDate.toString()))));
    }

    private long examId(ResultActions created) throws Exception {
        return data(created.andExpect(status().isOk()).andReturn()).get("id").asLong();
    }

    private ResultActions tag(String token, long cardId, List<Long> examIds) throws Exception {
        return mockMvc.perform(post("/api/cards/" + cardId + "/exams").header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON).content(json(Map.of("examIds", examIds))));
    }

    private List<String> examTitles(String token) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/exams").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andReturn();
        List<String> titles = new ArrayList<>();
        data(result).get("exams").forEach(exam -> titles.add(exam.get("title").asText()));
        return titles;
    }

    private List<Long> feedIds(String token, String param, Object value) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/cards").param(param, String.valueOf(value))
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andReturn();
        return ids(data(result).get("cards"));
    }

    private static List<Long> tagIds(JsonNode cardTagResponse) {
        return ids(cardTagResponse.get("exams"));
    }
}
