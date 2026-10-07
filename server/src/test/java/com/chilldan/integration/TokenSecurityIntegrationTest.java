package com.chilldan.integration;

import com.fasterxml.jackson.databind.JsonNode;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.ResultActions;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.assertj.core.api.Assertions.assertThat;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 토큰 수명주기 보안 회귀 테스트 (#472, P1-11). 설계 정본은 「칠단 보안 및 방어로직」 §2·§3.
 * <ul>
 *   <li>토큰 종류 분리: 보호 API는 access만, 재발급은 refresh만 받는다 — refresh(14일)를 Bearer로 쓰지 못한다</li>
 *   <li>재사용 탐지: 이미 쓴 refresh가 다시 오면 그 사용자의 refresh를 전부 폐기한다(탈취 세션 차단)</li>
 *   <li>전환기: 배포 전에 발급된 typ 없는 refresh는 재발급을 허용하고, typ 없는 access는 거부한다</li>
 *   <li>인증 실패는 401 + 공통 봉투(UNAUTHORIZED)</li>
 * </ul>
 */
class TokenSecurityIntegrationTest extends IntegrationTestSupport {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void refresh_토큰을_Bearer로_보내면_보호_API가_401이다() throws Exception {
        String refreshToken = registerForTokens("sec-refresh-as-bearer@test.com").get("refreshToken").asText();

        me(refreshToken)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorName").value("UNAUTHORIZED"));
    }

    @Test
    void 로그아웃한_뒤에도_그_refresh로_보호_API에_들어갈_수_없다() throws Exception {
        JsonNode tokens = registerForTokens("sec-logout-bearer@test.com");
        String refreshToken = tokens.get("refreshToken").asText();
        mockMvc.perform(post("/api/auth/logout").header("Authorization", bearer(tokens.get("accessToken").asText()))
                        .contentType(APPLICATION_JSON).content(json(Map.of("refreshToken", refreshToken))))
                .andExpect(status().isOk());

        me(refreshToken).andExpect(status().isUnauthorized());
    }

    @Test
    void access_토큰으로는_재발급할_수_없다() throws Exception {
        String accessToken = register("sec-access-as-refresh@test.com");

        refresh(accessToken)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorName").value("INVALID_REFRESH_TOKEN"));
    }

    @Test
    void 이미_쓴_refresh가_다시_오면_그_사용자의_refresh를_전부_폐기한다() throws Exception {
        String stolen = registerForTokens("sec-reuse@test.com").get("refreshToken").asText();
        // 정상 사용자(또는 탈취자)가 먼저 재발급해 새 refresh를 받는다.
        String current = data(refresh(stolen).andExpect(status().isOk()).andReturn()).get("refreshToken").asText();

        // 이미 쓴 토큰이 다시 온다 = 재사용 → 거부.
        refresh(stolen)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorName").value("INVALID_REFRESH_TOKEN"));
        // 누가 탈취자인지 모르므로 살아 있던 새 refresh도 함께 폐기된다.
        refresh(current).andExpect(status().isUnauthorized());
    }

    @Test
    void 같은_refresh로_동시에_재발급하면_하나만_성공하고_나머지는_재사용으로_거부된다() throws Exception {
        String token = registerForTokens("sec-concurrent-refresh@test.com").get("refreshToken").asText();
        CountDownLatch start = new CountDownLatch(1);
        Callable<Integer> call = () -> {
            start.await();
            return refresh(token).andReturn().getResponse().getStatus();
        };
        ExecutorService pool = Executors.newFixedThreadPool(2);
        try {
            Future<Integer> a = pool.submit(call);
            Future<Integer> b = pool.submit(call);
            start.countDown();
            // 조회 후 삭제였다면 둘 다 200(이중 발급)이거나 삭제 0행으로 500이 날 수 있다.
            assertThat(List.of(a.get(), b.get())).containsExactlyInAnyOrder(200, 401);
        } finally {
            pool.shutdownNow();
        }
    }

    @Test
    void 배포_전에_발급된_typ_없는_refresh는_재발급을_허용한다() throws Exception {
        long userId = userId(registerForTokens("sec-legacy-refresh@test.com"));
        String legacyRefresh = legacyToken(userId, 14 * 24 * 60 * 60 * 1000L);
        storeRefreshHash(userId, legacyRefresh);

        refresh(legacyRefresh)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty());
    }

    @Test
    void 배포_전에_발급된_typ_없는_access는_거부해_재발급을_유도한다() throws Exception {
        long userId = userId(registerForTokens("sec-legacy-access@test.com"));

        me(legacyToken(userId, 30 * 60 * 1000L))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorName").value("UNAUTHORIZED"));
    }

    private ResultActions me(String token) throws Exception {
        return mockMvc.perform(get("/api/me").header("Authorization", bearer(token)));
    }

    private ResultActions refresh(String refreshToken) throws Exception {
        return mockMvc.perform(post("/api/auth/refresh").contentType(APPLICATION_JSON)
                .content(json(Map.of("refreshToken", refreshToken))));
    }

    private long userId(JsonNode tokens) throws Exception {
        String email = tokens.get("user").get("email").asText();
        return jdbcTemplate.queryForObject("SELECT id FROM app_user WHERE email = ?", Long.class, email);
    }

    /** typ 클레임이 없던 배포 전 형식의 토큰을 같은 서명 키로 만든다. */
    private String legacyToken(long userId, long expMs) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(String.valueOf(userId))
                .issuedAt(new Date(now))
                .expiration(new Date(now + expMs))
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    private void storeRefreshHash(long userId, String token) throws Exception {
        String hash = HexFormat.of().formatHex(
                MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        jdbcTemplate.update("INSERT INTO refresh_token (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
                userId, hash, LocalDateTime.now().plusDays(14));
    }
}
