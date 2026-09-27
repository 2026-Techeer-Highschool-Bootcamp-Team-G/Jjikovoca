package com.jjikboka.app.integration;

import com.jjikboka.support.TestTimeZone;
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
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
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
        registry.add("spring.datasource.url", () -> TestTimeZone.jdbcUrl(MYSQL.getJdbcUrl()));
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

    // JVM·JDBC 연결 시간대를 프로덕션(KST)과 일치시킨다(매 테스트 직전 재설정) — JVM↔DB 시간대가 어긋나면
    // quota_date가 하루 밀리거나(#454) Hibernate가 읽는 created_at이 9시간 밀린다. 근거는 TestTimeZone.
    @BeforeEach
    void pinProductionTimezone() {
        TestTimeZone.pinJvm();
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

    /**
     * 분석 작업이 COMPLETED가 될 때까지 폴링한다(최대 ~30초). 워커가 AFTER_COMMIT 비동기라 필요하다.
     * mock은 보통 즉시 끝나지만, 크롭 10장 팬아웃을 느린 CI 러너에서 돌려도 넘치지 않게 여유를 둔다.
     */
    protected void awaitJobCompleted(String token, long jobId) throws Exception {
        for (int attempt = 0; attempt < 300; attempt++) {
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
        return ids(data(feed).get("cards"));
    }

    /**
     * 카드의 단어(정답)를 돌려준다. mock AI는 모든 크롭에 같은 단어("sound")를 돌려주므로,
     * 단어를 하드코딩하지 말고 이 헬퍼로 읽어 mock 응답이 바뀌어도 테스트가 따라가게 한다.
     */
    protected String cardWord(String token, long cardId) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/cards/" + cardId).header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andReturn();
        return data(result).get("word").asText();
    }

    /** 응답 배열에서 각 원소의 id를 뽑는다(카드 피드·큐 등 {@code [{id, ...}]} 형태 공통). */
    protected static List<Long> ids(JsonNode items) {
        List<Long> ids = new ArrayList<>();
        items.forEach(item -> ids.add(item.get("id").asLong()));
        return ids;
    }

    /**
     * 서버가 "오늘"을 기준으로 계산한 날짜를 검증한다. 요청 직전에 잰 {@code before}와 검증 시점의 오늘 중 하나에
     * {@code plusDays}를 더한 값이면 통과시켜, 테스트가 자정(KST)을 넘겨 실행돼도 흔들리지 않게 한다.
     */
    protected static void assertTodayPlus(LocalDate actual, LocalDate before, int plusDays) {
        assertThat(actual).isIn(before.plusDays(plusDays), LocalDate.now().plusDays(plusDays));
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
