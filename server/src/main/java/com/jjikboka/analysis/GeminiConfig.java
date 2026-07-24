package com.jjikboka.analysis;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Gemini WebClient 배선 (API-6). {@link GeminiProperties}를 활성화하고 base-url 고정 WebClient를 만든다.
 * 실 호출은 워커 전용 풀에서 블로킹(.block())하므로, 응답 버퍼 상한만 넉넉히 잡는다(비전 응답이 클 수 있음).
 */
@Configuration
@EnableConfigurationProperties(GeminiProperties.class)
class GeminiConfig {

    private static final int MAX_RESPONSE_BYTES = 8 * 1024 * 1024;

    @Bean
    WebClient geminiWebClient(GeminiProperties properties) {
        return WebClient.builder()
                .baseUrl(properties.getBaseUrl())
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(MAX_RESPONSE_BYTES))
                .build();
    }
}
