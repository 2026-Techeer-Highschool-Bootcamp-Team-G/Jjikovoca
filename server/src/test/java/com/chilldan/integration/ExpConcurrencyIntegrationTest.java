package com.chilldan.integration;

import com.chilldan.stats.service.ExpService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 경험치 동시 적립 경합 회귀 테스트 (#475).
 * <p>user_stat은 첫 적립 때 생기는데, 분석 워커의 캡처 적립(job 완료 직후)과 사용자의 첫 학습 적립이 겹치면
 * 두 트랜잭션이 모두 "행 없음"을 보고 INSERT해 PK 충돌로 요청이 실패했다. 이미 행이 있어도 exp를 읽고 더해 쓰는
 * 구조라 동시 적립이 서로를 덮어썼다(lost update). 여러 스레드가 한 번에 적립해도 모두 성공하고 정확히 합산되는지 본다.
 */
class ExpConcurrencyIntegrationTest extends IntegrationTestSupport {

    private static final int THREADS = 8;
    private static final int STUDY_EXP = 5;   // ExpService.STUDY_EXP — 8×5=40이라 일일 한도(100) 안쪽

    @Autowired
    private ExpService expService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void 새_사용자에게_동시에_적립해도_모두_성공하고_경험치가_정확히_합산된다() throws Exception {
        long userId = newUser("exp-race-new@test.com");

        List<Throwable> errors = awardConcurrently(userId);

        assertThat(errors).as("동시 첫 적립이 PK 충돌 없이 모두 성공해야 한다").isEmpty();
        assertThat(exp(userId)).isEqualTo(THREADS * STUDY_EXP);
    }

    @Test
    void 기존_사용자에게_동시에_적립해도_서로_덮어쓰지_않는다() throws Exception {
        long userId = newUser("exp-race-existing@test.com");
        expService.awardStudy(userId, true);   // user_stat 행을 먼저 만들어 둔다

        List<Throwable> errors = awardConcurrently(userId);

        assertThat(errors).isEmpty();
        assertThat(exp(userId)).isEqualTo((THREADS + 1) * STUDY_EXP);
    }

    private List<Throwable> awardConcurrently(long userId) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(THREADS);
        CountDownLatch start = new CountDownLatch(1);
        List<Future<?>> futures = new ArrayList<>();
        for (int i = 0; i < THREADS; i++) {
            futures.add(pool.submit(() -> {
                start.await();
                expService.awardStudy(userId, true);
                return null;
            }));
        }
        start.countDown();   // 모든 스레드를 한꺼번에 출발시켜 첫 생성 경합을 만든다
        List<Throwable> errors = new ArrayList<>();
        for (Future<?> future : futures) {
            try {
                future.get(30, TimeUnit.SECONDS);
            } catch (Exception e) {
                errors.add(e.getCause() == null ? e : e.getCause());
            }
        }
        pool.shutdown();
        return errors;
    }

    private long newUser(String email) throws Exception {
        mockMvc.perform(post("/api/auth/register").contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", email, "password", "pass1234!", "nickname", "경합"))))
                .andExpect(status().isOk());
        return jdbcTemplate.queryForObject("SELECT id FROM app_user WHERE email = ?", Long.class, email);
    }

    private int exp(long userId) {
        return jdbcTemplate.queryForObject("SELECT exp FROM user_stat WHERE user_id = ?", Integer.class, userId);
    }
}
