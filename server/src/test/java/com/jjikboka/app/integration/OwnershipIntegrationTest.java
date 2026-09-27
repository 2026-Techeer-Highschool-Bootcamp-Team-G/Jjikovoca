package com.jjikboka.app.integration;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 소유자 검증(IDOR) 회귀 테스트 (#470, P1-9 보안 리뷰 반영). 다른 사용자의 id를 넣어도 자원을 읽거나 지울 수 없어야 한다.
 * FR별 클래스가 이미 덮는 경로(학습 기록·빈칸 답·시험 수정·태깅·내보내기 다운로드)는 여기서 반복하지 않고,
 * 그 밖의 카드 조회·삭제와 분석 job 폴링을 지킨다.
 */
class OwnershipIntegrationTest extends IntegrationTestSupport {

    @Test
    void 남의_카드_상세는_403이다() throws Exception {
        long othersCard = seedCards(register("idor-card-owner@test.com"), 1).get(0);
        String intruder = register("idor-card-reader@test.com");

        mockMvc.perform(get("/api/cards/" + othersCard).header("Authorization", bearer(intruder)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorName").value("FORBIDDEN"));
    }

    @Test
    void 남의_카드는_지울_수_없고_주인에게_그대로_남는다() throws Exception {
        String owner = register("idor-delete-owner@test.com");
        long othersCard = seedCards(owner, 1).get(0);
        String intruder = register("idor-delete-intruder@test.com");

        mockMvc.perform(delete("/api/cards/" + othersCard).header("Authorization", bearer(intruder)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorName").value("FORBIDDEN"));
        mockMvc.perform(get("/api/cards/" + othersCard).header("Authorization", bearer(owner)))
                .andExpect(status().isOk());
    }

    @Test
    void 남의_분석_job은_폴링할_수_없다() throws Exception {
        String owner = register("idor-job-owner@test.com");
        MvcResult accepted = submitAnalyze(owner, 1).andExpect(status().isAccepted()).andReturn();
        long jobId = data(accepted).get("jobId").asLong();
        String intruder = register("idor-job-reader@test.com");

        mockMvc.perform(get("/api/cards/analyze/" + jobId).header("Authorization", bearer(intruder)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorName").value("FORBIDDEN"));
    }

    /**
     * 현행 계약: 인증이 없으면 Spring Security 기본 진입점이 봉투(ApiResponse) 없는 403을 준다. web 클라이언트는
     * "403 + success:false 봉투 없음"을 인증 실패로 보고 토큰을 갱신한다(web/src/shared/api/client.ts) — 업무상 권한 거부
     * (403 + success:false + FORBIDDEN)와 이 구분이 깨지면 갱신 로직이 멈추므로 여기서 지킨다.
     * 401로 바꾸는 것은 P1-11(보안)에서 web과 함께 다룬다.
     */
    @Test
    void 인증_없이_보호된_API를_부르면_봉투_없는_403으로_업무상_권한거부와_구분된다() throws Exception {
        mockMvc.perform(get("/api/cards"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").doesNotExist());
    }
}
