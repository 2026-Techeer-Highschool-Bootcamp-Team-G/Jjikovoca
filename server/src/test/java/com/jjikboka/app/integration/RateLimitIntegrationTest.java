package com.jjikboka.app.integration;

import org.junit.jupiter.api.Test;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.ResultActions;

import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 인증 엔드포인트 rate limit (#479, P1-11 D). 설계 정본은 「찍어보카 보안 및 방어로직」 §5.
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

        // 신뢰 프록시 설정이 없으면 헤더는 무시되고 실제 접속 IP로 센다.
        mockMvc.perform(post("/api/auth/login").with(r -> { r.setRemoteAddr(ip); return r; })
                        .header("X-Forwarded-For", randomIp())
                        .contentType(APPLICATION_JSON).content(json(credentials())))
                .andExpect(status().isTooManyRequests());
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
