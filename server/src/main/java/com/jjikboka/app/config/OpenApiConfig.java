package com.jjikboka.app.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * SpringDoc OpenAPI 설정 — Swagger UI(`/swagger-ui.html`)로 04 명세서와 실제 구현을 상호 대조한다.
 *
 * JWT 무상태 인증(13 §5)이라 대부분의 엔드포인트가 `Authorization: Bearer {token}`을 요구한다.
 * bearer 보안 스킴을 전역으로 걸어, Swagger UI의 Authorize 버튼으로 토큰을 넣고 시험할 수 있게 한다.
 */
@Configuration
public class OpenApiConfig {

    private static final String BEARER = "bearerAuth";

    @Bean
    OpenAPI jjikbokaOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("찍어보카 API")
                        .description("찍어보카 백엔드 REST API — 04_API_명세서 대응")
                        .version("v0.0.1"))
                .addSecurityItem(new SecurityRequirement().addList(BEARER))
                .components(new Components().addSecuritySchemes(BEARER,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT 액세스 토큰. 로그인 응답의 token을 넣는다.")));
    }
}
