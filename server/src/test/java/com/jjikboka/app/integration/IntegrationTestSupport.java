package com.jjikboka.app.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.MySQLContainer;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;

/**
 * 통합 테스트 베이스 (08 §3, H2 금지). 실 MySQL·Redis를 Testcontainers로 띄우고 그 접속값을 @DynamicPropertySource로 주입한다.
 * Flyway가 컨테이너에 마이그레이션을 실행하고 Hibernate는 validate만 한다 — 프로덕션과 같은 스키마 경로를 탄다.
 *
 * <p>외부 의존은 없앤다: Gemini는 mock, 이미지·내보내기는 temp 디렉토리. 컨테이너는 싱글톤(static 블록에서 JVM당 1회 기동)이라
 * 모든 통합테스트 클래스가 공유한다(클래스 단위 start/stop이 없어, 통합테스트가 여럿이어도 컨테이너 라이프사이클 레이스가 없다).
 * {@code com.jjikboka.app} 하위라 {@code JjikbokaApplication}(같은 패키지 트리)이 @SpringBootConfiguration으로 잡힌다.
 */
@SpringBootTest
@AutoConfigureMockMvc
abstract class IntegrationTestSupport {

    // 싱글톤 컨테이너 — JVM당 1회 기동해 모든 통합테스트 클래스가 공유한다(Ryuk가 JVM 종료 시 정리).
    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("jjikeoboka");

    static final GenericContainer<?> REDIS = new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379);

    static {
        MYSQL.start();
        REDIS.start();
    }

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

    // 테스트 JVM을 UTC로 고정한다(컨텍스트 기동이 기본 tz를 OS값으로 되돌리므로 매 테스트 직전에 재설정) —
    // UTC인 MySQL 세션과 정렬해 JDBC의 DATE tz 변환으로 "오늘"(quota_date 등) 기준 로직이 어긋나는 것을 막는다.
    @BeforeEach
    void pinUtcTimezone() {
        java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("UTC"));
    }

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;
}
