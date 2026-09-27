package com.jjikboka.app.integration;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.ResultActions;

import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * API 보안 응답 헤더 (#482, P1-11 E). 설계 정본은 「찍어보카 보안 및 방어로직」 §6.
 * 성공 응답뿐 아니라 인증 실패(401) 응답에도 같은 헤더가 붙어야 한다.
 */
class SecurityHeadersIntegrationTest extends IntegrationTestSupport {

    private static final String API_CSP = "default-src 'none'; frame-ancestors 'none'";

    @Test
    void 성공_응답에_보안_헤더가_붙는다() throws Exception {
        assertSecurityHeaders(mockMvc.perform(get("/api/me").header("Authorization", bearer(register("hdr-ok@test.com"))))
                .andExpect(status().isOk()));
    }

    @Test
    void 인증_실패_응답에도_보안_헤더가_붙는다() throws Exception {
        assertSecurityHeaders(mockMvc.perform(get("/api/me")).andExpect(status().isUnauthorized()));
    }

    @Test
    void HSTS는_HTTPS_요청에만_붙는다() throws Exception {
        mockMvc.perform(get("/api/health").secure(true))
                .andExpect(header().string("Strict-Transport-Security", startsWith("max-age=")));
        mockMvc.perform(get("/api/health"))
                .andExpect(header().doesNotExist("Strict-Transport-Security"));
    }

    @Test
    void Swagger_경로는_CSP에서_제외한다() throws Exception {
        // 로컬 명세 대조용 UI가 스크립트를 쓰므로 제외. 운영에서는 springdoc 자체가 꺼진다(application-prod.yml).
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(header().doesNotExist("Content-Security-Policy"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"));
    }

    private static void assertSecurityHeaders(ResultActions result) throws Exception {
        result.andExpect(header().string("Content-Security-Policy", API_CSP))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("Referrer-Policy", "no-referrer"));
    }
}
