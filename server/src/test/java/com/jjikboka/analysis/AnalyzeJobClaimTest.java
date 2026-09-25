package com.jjikboka.analysis;

import com.jjikboka.analysis.dto.AnalyzeJobClaim;
import com.jjikboka.analysis.repository.AnalyzeJobRepository;
import com.jjikboka.analysis.service.AnalyzeJobService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * lease 기반 claim 정합성 (P1-6 커밋2). claim은 조건부 원자 UPDATE라 동시 경합에도 정확히 1개만 성공하고,
 * PENDING·lease 만료 RUNNING만 claimable이며, 살아있는 lease는 재claim되지 않아야 한다.
 */
class AnalyzeJobClaimTest extends AnalyzeJobTestSupport {

    @Autowired
    private AnalyzeJobService analyzeJobService;

    @Autowired
    private AnalyzeJobRepository analyzeJobRepository;

    @Test
    void PENDING_job을_claim하면_RUNNING으로_전이하고_attempts가_1이_된다() {
        Long jobId = analyzeJobService.create(1L, "{\"type\":\"WORD\"}");

        Optional<AnalyzeJobClaim> claim = analyzeJobService.claim(jobId);

        assertThat(claim).isPresent();
        assertThat(claim.get().jobId()).isEqualTo(jobId);
        assertThat(claim.get().userId()).isEqualTo(1L);
        // MySQL JSON은 canonical 형태로 되돌린다(공백·키 순서 정규화) — 내용만 확인한다.
        assertThat(claim.get().payloadJson()).contains("\"type\"").contains("\"WORD\"");
        assertThat(claim.get().attempts()).isEqualTo(1);
        assertThat(status(jobId)).isEqualTo("RUNNING");
    }

    @Test
    void 이미_claim된_살아있는_lease는_다시_claim되지_않는다() {
        Long jobId = analyzeJobService.create(1L, null);

        assertThat(analyzeJobService.claim(jobId)).isPresent();   // 첫 claim 성공(lease 미래로 잡힘)
        assertThat(analyzeJobService.claim(jobId)).isEmpty();     // lease 살아있어 두 번째는 경합 패배
    }

    @Test
    void lease가_만료된_RUNNING_job은_다시_claim되어_재처리된다() {
        Long jobId = analyzeJobService.create(1L, null);
        // RUNNING이지만 lease가 과거 — 워커가 사망한 상태를 흉내 낸다.
        jdbcTemplate.update("UPDATE analyze_job SET status='RUNNING', lease_until=DATE_SUB(NOW(6), INTERVAL 10 MINUTE), attempts=1 WHERE id=?",
                jobId);

        Optional<AnalyzeJobClaim> claim = analyzeJobService.claim(jobId);

        assertThat(claim).isPresent();
        assertThat(claim.get().attempts()).isEqualTo(2);   // 재수거로 attempts 증가
    }

    @Test
    void DONE_job은_claim되지_않는다() {
        Long jobId = analyzeJobService.create(1L, null);
        analyzeJobService.markDone(jobId);

        assertThat(analyzeJobService.claim(jobId)).isEmpty();
    }

    @Test
    void 동시에_claim해도_정확히_한_스레드만_성공한다() throws Exception {
        Long jobId = analyzeJobService.create(1L, null);

        int threads = 8;
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        try {
            List<Callable<Boolean>> tasks = new java.util.ArrayList<>();
            for (int i = 0; i < threads; i++) {
                tasks.add(() -> analyzeJobService.claim(jobId).isPresent());
            }
            List<Future<Boolean>> results = pool.invokeAll(tasks);
            long won = results.stream().filter(f -> {
                try {
                    return f.get();
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }).count();

            assertThat(won).isEqualTo(1);   // 원자 UPDATE라 경합해도 승자는 정확히 1
        } finally {
            pool.shutdownNow();
        }
    }

    @Test
    void claimable_조회는_PENDING과_lease만료_RUNNING만_돌려준다() {
        Long pending = analyzeJobService.create(1L, null);
        Long liveRunning = analyzeJobService.create(1L, null);
        Long expiredRunning = analyzeJobService.create(1L, null);
        Long done = analyzeJobService.create(1L, null);

        jdbcTemplate.update("UPDATE analyze_job SET status='RUNNING', lease_until=DATE_ADD(NOW(6), INTERVAL 10 MINUTE) WHERE id=?",
                liveRunning);
        jdbcTemplate.update("UPDATE analyze_job SET status='RUNNING', lease_until=DATE_SUB(NOW(6), INTERVAL 10 MINUTE) WHERE id=?",
                expiredRunning);
        analyzeJobService.markDone(done);

        List<Long> claimable = analyzeJobService.findClaimableIds();

        assertThat(claimable).contains(pending, expiredRunning);
        assertThat(claimable).doesNotContain(liveRunning, done);
    }

    private String status(Long jobId) {
        return jdbcTemplate.queryForObject("SELECT status FROM analyze_job WHERE id=?", String.class, jobId);
    }
}
