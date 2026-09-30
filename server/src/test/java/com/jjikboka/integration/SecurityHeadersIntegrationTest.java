package com.jjikboka.integration;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.ResultActions;

import static org.hamcrest.Matchers.containsString;
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
    void 없는_경로의_404에도_보안_헤더가_붙는다() throws Exception {
        assertSecurityHeaders(mockMvc.perform(get("/api/no-such-path")
                        .header("Authorization", bearer(register("hdr-404@test.com"))))
                .andExpect(status().isNotFound()));
    }

    @Test
    void Swagger_UI만_CSP에서_제외하고_API_문서는_CSP를_건다() throws Exception {
        // 로컬 명세 대조용 UI가 스크립트를 쓰므로 제외. 운영에서는 springdoc 자체가 꺼진다(SwaggerDisabled 테스트).
        mockMvc.perform(get("/swagger-ui/index.html"))
                .andExpect(status().isOk())
                .andExpect(header().doesNotExist("Content-Security-Policy"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"));
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Security-Policy", API_CSP));
    }

    private static void assertSecurityHeaders(ResultActions result) throws Exception {
        result.andExpect(header().string("Content-Security-Policy", API_CSP))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("Referrer-Policy", "no-referrer"))
                // 인증된 JSON이 브라우저·중간 캐시에 남지 않게 — Spring Security 기본값이 빠지지 않았는지 고정한다.
                .andExpect(header().string("Cache-Control", containsString("no-store")));
    }
}
