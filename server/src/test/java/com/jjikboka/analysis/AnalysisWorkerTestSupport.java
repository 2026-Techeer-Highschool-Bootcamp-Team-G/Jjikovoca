package com.jjikboka.analysis;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.MySQLContainer;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * app.analysis 내구 처리(P1-6) 테스트 베이스 — watchdog·워커가 패키지 비공개라 같은 패키지에서 실 MySQL/Redis(Testcontainers)로
 * 크래시 재수거·정확히 1회·멱등 재처리를 검증한다(08 §3). watchdog 자동 스윕은 꺼두고(interval을 아주 크게) 테스트가 직접 sweep을 호출한다 —
 * 스케줄러 타이밍에 의존하지 않아 결정적이다. Gemini는 mock, 이미지·내보내기는 temp 디렉토리로 외부 의존을 없앤다.
 */
@SpringBootTest(classes = com.jjikboka.JjikbokaApplication.class,
        properties = "app.analyze.watchdog.interval-ms=3600000")
abstract class AnalysisWorkerTestSupport {

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

    // card·user_quota_daily·user_stat이 app_user(id)에 FK를 걸므로, 처리가 카드/환불을 쓰려면 실제 사용자가 있어야 한다.
    private static final AtomicInteger USER_SEQ = new AtomicInteger();

    @Autowired
    protected JdbcTemplate jdbcTemplate;

    /** 테스트 간 격리 — 공유 컨테이너라 이전 테스트 잔여 행이 끼어들지 않게 매 테스트 전에 관련 테이블을 비운다(FK 순서: card→quota→job). */
    @BeforeEach
    void cleanTables() {
        // 테스트 JVM을 UTC로 고정한다(컨텍스트 기동이 기본 tz를 OS값으로 되돌리므로 매 테스트 직전에 재설정).
        // Testcontainers MySQL 세션이 UTC라, 개발기/CI 기본 tz(예: Asia/Seoul)에선 JDBC가 LocalDate(quota_date)를
        // tz 변환하며 하루 밀어 넣어 "오늘" 기준 조회·환불이 어긋난다(UTC 자정 근처에만 재현되는 시각 의존 실패).
        java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("UTC"));
        jdbcTemplate.update("DELETE FROM card");
        jdbcTemplate.update("DELETE FROM user_quota_daily");
        jdbcTemplate.update("DELETE FROM analyze_job");
    }

    /** 유니크 이메일로 app_user를 만들고 id를 돌려준다 — 처리(카드 INSERT·quota 환불·exp)가 FK를 만족하게 한다. */
    protected long insertUser() {
        String email = "worker-" + USER_SEQ.incrementAndGet() + "-" + System.nanoTime() + "@test.com";
        jdbcTemplate.update(
                "INSERT INTO app_user (email, password_hash, nickname) VALUES (?, 'x', '테스터')", email);
        return jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
    }
}
