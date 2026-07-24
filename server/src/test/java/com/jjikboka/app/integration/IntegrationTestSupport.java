package com.jjikboka.app.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;

/**
 * 통합 테스트 베이스 (08 §3, H2 금지). 실 MySQL·Redis를 Testcontainers로 띄우고 그 접속값을 @DynamicPropertySource로 주입한다.
 * Flyway가 컨테이너에 마이그레이션을 실행하고 Hibernate는 validate만 한다 — 프로덕션과 같은 스키마 경로를 탄다.
 *
 * <p>외부 의존은 없앤다: Gemini는 mock, 이미지·내보내기는 temp 디렉토리. 컨테이너는 static이라 클래스 내 테스트가 공유한다.
 * {@code com.jjikboka.app} 하위라 {@code JjikbokaApplication}(같은 패키지 트리)이 @SpringBootConfiguration으로 잡힌다.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
abstract class IntegrationTestSupport {

    @Container
    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("jjikeoboka");

    @Container
    static final GenericContainer<?> REDIS = new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379);

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
        registry.add("spring.data.redis.host", REDIS::getHost);
        registry.add("spring.data.redis.port", () -> REDIS.getMappedPort(6379));
        registry.add("gemini.mock", () -> "true");
        registry.add("app.image.dir", () -> tempDir("images"));
        registry.add("app.export.dir", () -> tempDir("exports"));
    }

    private static String tempDir(String name) {
        try {
            return Files.createTempDirectory("jjik-" + name).toString();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;
}
