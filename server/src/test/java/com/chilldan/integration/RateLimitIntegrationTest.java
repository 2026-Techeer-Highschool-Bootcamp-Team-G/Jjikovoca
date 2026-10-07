package com.chilldan.integration;

import org.junit.jupiter.api.Test;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.ResultActions;

import java.net.URI;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 인증 엔드포인트 rate limit (#479, P1-11 D). 설계 정본은 「칠단 보안 및 방어로직」 §5.
 * 실 Redis(Testcontainers)에 카운터를 쌓는다. 테스트마다 다른 IP를 써 카운터가 서로 섞이지 않게 한다.
 */
@TestPropertySource(properties = "app.rate-limit.enabled=true")
class RateLimitIntegrationTest extends IntegrationTestSupport {

    @Test
    void 같은_IP의_로그인은_분당_10회까지_받고_11번째는_429다() throws Exception {
        String ip = randomIp();
        for (int i = 0; i < 10; i++) {
            login(ip).andExpect(status().isUnauthorized());   // 한도 안: 인증 결과(틀린 비밀번호)가 그대로 온다
        }

        String retryAfter = login(ip)
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.errorName").value("RATE_LIMITED"))
                .andExpect(jsonPath("$.errorCode").value("429"))
                .andExpect(header().exists("Retry-After"))
                .andReturn().getResponse().getHeader("Retry-After");
        assertThat(Integer.parseInt(retryAfter)).isBetween(1, 60);
    }

    @Test
    void 한도는_IP마다_따로_센다() throws Exception {
        String blocked = randomIp();
        for (int i = 0; i < 10; i++) {
            login(blocked);
        }
        login(blocked).andExpect(status().isTooManyRequests());

        login(randomIp()).andExpect(status().isUnauthorized());
    }

    @Test
    void X_Forwarded_For를_바꿔_보내도_한도를_피할_수_없다() throws Exception {
        String ip = randomIp();
        for (int i = 0; i < 10; i++) {
            login(ip).andExpect(status().isUnauthorized());
        }

        // 앱은 X-Forwarded-For를 직접 읽지 않는다 — 헤더를 바꿔도 접속 IP로 센다. MockMvc는 Tomcat 프록시 처리
        // (forward-headers-strategy)를 거치지 않으므로, 운영 프록시 뒤 신뢰 경계는 실제 부팅 E2E와 #481에서 확인한다.
        mockMvc.perform(post("/api/auth/login").with(r -> { r.setRemoteAddr(ip); return r; })
                        .header("X-Forwarded-For", randomIp())
                        .contentType(APPLICATION_JSON).content(json(credentials())))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void 경로_글자를_퍼센트_인코딩해도_같은_한도로_센다() throws Exception {
        String ip = randomIp();
        // /api/auth/%6Cogin 은 컨트롤러·인가 규칙에는 /api/auth/login 으로 매칭된다 — 원시 URI로 세면 한도를 우회한다.
        String[] variants = {"/api/auth/login", "/api/auth/%6Cogin", "/api/%61uth/login", "/api/auth/%6cogin"};
        for (int i = 0; i < 10; i++) {
            loginAt(URI.create(variants[i % variants.length]), ip).andExpect(status().isUnauthorized());
        }
        // 11번째 — 인코딩을 바꿔도 같은 카운터라 막혀야 한다.
        loginAt(URI.create("/api/auth/l%6Fgin"), ip).andExpect(status().isTooManyRequests());
    }

    @Test
    void 가입은_분당_5회까지다() throws Exception {
        String ip = randomIp();
        for (int i = 0; i < 5; i++) {
            register(ip, "rl-register-" + ip + "-" + i + "@test.com").andExpect(status().is2xxSuccessful());
        }

        register(ip, "rl-register-" + ip + "-over@test.com")
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.errorName").value("RATE_LIMITED"));
    }

    private ResultActions login(String ip) throws Exception {
        return mockMvc.perform(post("/api/auth/login").with(r -> { r.setRemoteAddr(ip); return r; })
                .contentType(APPLICATION_JSON).content(json(credentials())));
    }

    private ResultActions loginAt(URI uri, String ip) throws Exception {
        return mockMvc.perform(post(uri).with(r -> { r.setRemoteAddr(ip); return r; })
                .contentType(APPLICATION_JSON).content(json(credentials())));
    }

    private ResultActions register(String ip, String email) throws Exception {
        return mockMvc.perform(post("/api/auth/register").with(r -> { r.setRemoteAddr(ip); return r; })
                .contentType(APPLICATION_JSON)
                .content(json(Map.of("email", email, "password", "pass1234!", "nickname", "rl"))));
    }

    private static Map<String, String> credentials() {
        return Map.of("email", "rl-nobody@test.com", "password", "wrong-password");
    }

    private static String randomIp() {
        ThreadLocalRandom r = ThreadLocalRandom.current();
        return "10." + r.nextInt(256) + "." + r.nextInt(256) + "." + r.nextInt(1, 255);
    }
}
