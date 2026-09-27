package com.jjikboka.app.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.MySQLContainer;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

    // ── 공용 픽스처 ──────────────────────────────────────────────────────────────
    // 싱글톤 컨테이너를 모든 테스트가 공유하므로, 테스트마다 고유 이메일로 가입해 데이터 간섭을 막는다.

    /** 1x1 PNG data URL — 분석 접수 검증(비어있지 않은 base64)을 통과한다. */
    protected static final String IMAGE =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

    protected static final String PASSWORD = "pass1234!";

    /** 회원가입 후 토큰 응답(data)을 돌려준다 — accessToken·refreshToken이 필요한 인증 테스트용. */
    protected JsonNode registerForTokens(String email) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "email", email, "password", PASSWORD, "nickname", "테스터"));
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andReturn();
        return data(result);
    }

    /** 회원가입 후 accessToken을 돌려준다. */
    protected String register(String email) throws Exception {
        return registerForTokens(email).get("accessToken").asText();
    }

    /** 분석 접수 요청(mock AI). 크롭 N장을 한 번에 보내 쿼터 1회로 카드 N장을 만든다. */
    protected ResultActions submitAnalyze(String token, int cropCount) throws Exception {
        String[] crops = new String[cropCount];
        Arrays.fill(crops, IMAGE);
        String body = objectMapper.writeValueAsString(Map.of(
                "type", "WORD", "cropImages", crops, "fullImage", IMAGE));
        return mockMvc.perform(post("/api/cards/analyze")
                .header("Authorization", bearer(token)).contentType(APPLICATION_JSON).content(body));
    }

    /** 분석 작업이 COMPLETED가 될 때까지 짧게 폴링한다(최대 ~5초). 워커가 AFTER_COMMIT 비동기라 필요하다. */
    protected void awaitJobCompleted(String token, long jobId) throws Exception {
        for (int attempt = 0; attempt < 50; attempt++) {
            MvcResult poll = mockMvc.perform(get("/api/cards/analyze/" + jobId)
                            .header("Authorization", bearer(token)))
                    .andExpect(status().isOk())
                    .andReturn();
            String jobStatus = data(poll).get("status").asText();
            if ("COMPLETED".equals(jobStatus)) {
                return;
            }
            if ("FAILED".equals(jobStatus)) {
                throw new AssertionError("분석 작업이 실패했다: jobId=" + jobId);
            }
            Thread.sleep(100);
        }
        throw new AssertionError("분석 작업이 제한시간 내 완료되지 않았다: jobId=" + jobId);
    }

    /** mock 분석으로 카드 N장을 만들고, 피드에 보이는 카드 id를 돌려준다. */
    protected List<Long> seedCards(String token, int count) throws Exception {
        MvcResult accepted = submitAnalyze(token, count).andExpect(status().isAccepted()).andReturn();
        awaitJobCompleted(token, data(accepted).get("jobId").asLong());

        MvcResult feed = mockMvc.perform(get("/api/cards").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andReturn();
        List<Long> ids = new ArrayList<>();
        data(feed).get("cards").forEach(card -> ids.add(card.get("id").asLong()));
        return ids;
    }

    protected JsonNode data(MvcResult result) throws Exception {
        String json = result.getResponse().getContentAsString(StandardCharsets.UTF_8);
        return objectMapper.readTree(json).get("data");
    }

    protected String bearer(String token) {
        return "Bearer " + token;
    }

    protected String json(Object body) throws Exception {
        return objectMapper.writeValueAsString(body);
    }
}
