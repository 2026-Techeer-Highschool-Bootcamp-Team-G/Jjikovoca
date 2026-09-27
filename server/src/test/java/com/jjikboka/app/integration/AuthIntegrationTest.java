package com.jjikboka.app.integration;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * FR-1 로그인/회원가입 인수조건 (#470, P1-9).
 * <ul>
 *   <li>Given 미가입 이메일, When 올바른 형식으로 가입, Then 계정 생성 후 로그인 가능</li>
 *   <li>Given 만료된 access, When refresh 요청, Then 새 토큰 발급</li>
 *   <li>예외: 중복 이메일 거부 · 비밀번호 불일치 401 · 앱 내 계정 탈퇴</li>
 * </ul>
 * refresh는 rotation(사용한 토큰 즉시 폐기)이라, 같은 초에 재발급돼도 옛 토큰이 되살아나지 않는지(jti 고유성)도 함께 지킨다.
 * <p>부분 커버리지: "만료된 access"는 시간을 조작하지 않고 refresh 재발급 경로만 검증한다(만료 자체는 JWT 라이브러리 책임).
 * 알려진 결함: access·refresh 토큰에 종류(typ) 구분이 없어 refresh 토큰이 Bearer로 통과한다 — P1-11(보안)에서 고친다.
 */
class AuthIntegrationTest extends IntegrationTestSupport {

    @Test
    void 미가입_이메일로_가입하면_계정이_생기고_같은_자격증명으로_로그인된다() throws Exception {
        JsonNode registered = registerForTokens("fr1-signup@test.com");
        assertThat(registered.get("accessToken").asText()).isNotBlank();
        assertThat(registered.get("refreshToken").asText()).isNotBlank();
        assertThat(registered.get("user").get("email").asText()).isEqualTo("fr1-signup@test.com");

        login("fr1-signup@test.com", PASSWORD)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value("fr1-signup@test.com"));
    }

    @Test
    void 발급된_access_토큰으로_보호된_API에_접근할_수_있다() throws Exception {
        String token = register("fr1-access@test.com");

        mockMvc.perform(get("/api/me").header("Authorization", bearer(token)))
                .andExpect(status().isOk());
    }

    @Test
    void 이미_가입된_이메일로_다시_가입하면_DUPLICATE_EMAIL로_거부된다() throws Exception {
        register("fr1-dup@test.com");

        mockMvc.perform(post("/api/auth/register").contentType(APPLICATION_JSON)
                        .content(json(Map.of("email", "fr1-dup@test.com", "password", PASSWORD, "nickname", "중복"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errorName").value("DUPLICATE_EMAIL"));
    }

    @Test
    void 비밀번호가_틀리면_401이고_계정_존재여부를_노출하지_않는다() throws Exception {
        register("fr1-wrongpw@test.com");

        // 비밀번호 불일치와 미가입 이메일이 같은 코드로 응답해야 계정 존재 여부가 새지 않는다.
        login("fr1-wrongpw@test.com", "wrong-password")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorName").value("INVALID_CREDENTIALS"));
        login("fr1-nobody@test.com", PASSWORD)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorName").value("INVALID_CREDENTIALS"));
    }

    @Test
    void refresh_토큰으로_새_토큰쌍을_받고_사용한_refresh는_재사용할_수_없다() throws Exception {
        String oldRefresh = registerForTokens("fr1-refresh@test.com").get("refreshToken").asText();

        MvcResult refreshed = refresh(oldRefresh)
                .andExpect(status().isOk())
                .andReturn();
        String newRefresh = data(refreshed).get("refreshToken").asText();
        assertThat(data(refreshed).get("accessToken").asText()).isNotBlank();
        // 같은 초에 재발급돼도 jti로 토큰이 달라야 rotation이 성립한다.
        assertThat(newRefresh).isNotEqualTo(oldRefresh);

        // rotation — 이미 쓴 refresh는 폐기됐으므로 재사용하면 거부된다.
        refresh(oldRefresh)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorName").value("INVALID_REFRESH_TOKEN"));
        // 새 refresh는 유효하다.
        refresh(newRefresh).andExpect(status().isOk());
    }

    @Test
    void 위조된_refresh_토큰은_거부된다() throws Exception {
        refresh("not-a-jwt")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorName").value("INVALID_REFRESH_TOKEN"));
    }

    @Test
    void 로그아웃하면_그_refresh로_더_이상_갱신할_수_없고_재요청도_성공한다() throws Exception {
        JsonNode tokens = registerForTokens("fr1-logout@test.com");
        String access = tokens.get("accessToken").asText();
        String refreshToken = tokens.get("refreshToken").asText();

        logout(access, refreshToken).andExpect(status().isOk());
        refresh(refreshToken).andExpect(status().isUnauthorized());
        // 멱등 — 이미 폐기된 refresh로 다시 로그아웃해도 200이다.
        logout(access, refreshToken).andExpect(status().isOk());
    }

    @Test
    void 계정을_탈퇴하면_같은_자격증명으로_로그인할_수_없고_refresh도_폐기된다() throws Exception {
        JsonNode tokens = registerForTokens("fr1-withdraw@test.com");
        String access = tokens.get("accessToken").asText();

        mockMvc.perform(delete("/api/account").header("Authorization", bearer(access)))
                .andExpect(status().isOk());

        login("fr1-withdraw@test.com", PASSWORD)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorName").value("INVALID_CREDENTIALS"));
        refresh(tokens.get("refreshToken").asText())
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorName").value("INVALID_REFRESH_TOKEN"));
    }

    private ResultActions login(String email, String password) throws Exception {
        return mockMvc.perform(post("/api/auth/login").contentType(APPLICATION_JSON)
                .content(json(Map.of("email", email, "password", password))));
    }

    private ResultActions refresh(String refreshToken) throws Exception {
        return mockMvc.perform(post("/api/auth/refresh").contentType(APPLICATION_JSON)
                .content(json(Map.of("refreshToken", refreshToken))));
    }

    private ResultActions logout(String accessToken, String refreshToken) throws Exception {
        return mockMvc.perform(post("/api/auth/logout").header("Authorization", bearer(accessToken))
                .contentType(APPLICATION_JSON).content(json(Map.of("refreshToken", refreshToken))));
    }
}
