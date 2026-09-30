package com.jjikboka.integration;

import org.junit.jupiter.api.Test;
import org.springframework.test.context.TestPropertySource;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** 운영 설정(application-prod.yml의 springdoc 비활성)에서는 API 문서·Swagger UI가 열리지 않는다 (#482, P1-11 E). */
@TestPropertySource(properties = {"springdoc.api-docs.enabled=false", "springdoc.swagger-ui.enabled=false"})
class SwaggerDisabledIntegrationTest extends IntegrationTestSupport {

    @Test
    void 운영_설정에서는_API_문서와_Swagger_UI가_없다() throws Exception {
        mockMvc.perform(get("/v3/api-docs")).andExpect(status().isNotFound());
        mockMvc.perform(get("/swagger-ui/index.html")).andExpect(status().isNotFound());
    }
}
