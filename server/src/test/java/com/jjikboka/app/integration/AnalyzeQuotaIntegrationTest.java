package com.jjikboka.app.integration;

import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 분석 접수 쿼터 경로 회귀 테스트 (P1-4, 결함 P0-02 가드). 시현용 demo 하드캡(총 3회)·이메일 우회를 제거한 뒤,
 * 무료 사용자의 유일한 제한이 일일 쿼터(free 5)임을 검증한다.
 * 옛 하드캡이 되살아나면 4회째 접수부터 EXTRACT_LIMIT_REACHED(429)로 여기서 바로 빨간불이 된다.
 */
class AnalyzeQuotaIntegrationTest extends IntegrationTestSupport {

    @Test
    void 무료사용자는_옛_demo캡3을_넘겨_일일한도5까지_접수하고_초과는_QUOTA_EXCEEDED다() throws Exception {
        String token = register("quota-path@test.com");

        // 옛 demo 하드캡(3회)이 제거됐으므로 무료 일일 한도(5)까지 모두 접수(202)된다.
        for (int i = 1; i <= 5; i++) {
            submitAnalyze(token, 1).andExpect(status().isAccepted());
        }

        // 6회째는 일일 쿼터 초과 — demo 캡(EXTRACT_LIMIT_REACHED)이 아니라 QUOTA_EXCEEDED여야 한다.
        submitAnalyze(token, 1)
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorName").value("QUOTA_EXCEEDED"));
    }
}
