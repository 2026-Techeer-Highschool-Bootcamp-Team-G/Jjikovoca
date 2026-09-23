package com.jjikboka.analysis;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.MySQLContainer;

/**
 * analysis 슬라이스 내구 처리(P1-6) 테스트 베이스. 엔티티·레포지토리·서비스가 패키지 비공개라
 * 같은 패키지에서 실 MySQL(Testcontainers)로 claim·watchdog 정합성을 검증한다(08 §3, H2 금지).
 *
 * <p>Flyway가 컨테이너에 V1~V8을 실행하고 Hibernate는 validate만 한다 — 프로덕션과 같은 스키마 경로(V8 ↔ 엔티티 매핑 일치 검증 포함).
 * 컨테이너는 static 싱글톤(JVM당 1회)이라 이 패키지 테스트들이 공유한다(Ryuk가 JVM 종료 시 정리).
 */
@SpringBootTest(classes = com.jjikboka.app.JjikbokaApplication.class)
abstract class AnalyzeJobTestSupport {

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
    }

    @Autowired
    protected JdbcTemplate jdbcTemplate;

    /** 테스트 간 격리 — 공유 컨테이너라 이전 테스트가 남긴 analyze_job 행이 claim·조회에 끼어들지 않게 매 테스트 전에 비운다. */
    @BeforeEach
    void cleanAnalyzeJob() {
        jdbcTemplate.update("DELETE FROM analyze_job");
    }
}
