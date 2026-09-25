package com.jjikboka.analysis;

import com.jjikboka.analysis.service.AnalyzeJobWatchdog;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * watchdog 재수거 정합성 (P1-6 커밋3). 이벤트 없이 직접 삽입한 PENDING job(=접수 커밋 후 @Async 미실행 크래시 흉내)을
 * sweep이 재수거해 DONE + 카드 생성까지 끌고 가야 한다. lease 만료 RUNNING(워커 사망)도 되살아나야 한다.
 * 자동 스케줄은 꺼져 있어(interval 매우 큼) 테스트가 sweep을 직접 호출한다 — 타이밍에 의존하지 않는다.
 */
class AnalyzeJobWatchdogTest extends AnalysisWorkerTestSupport {

    @Autowired
    private AnalyzeJobWatchdog watchdog;

    @Test
    void 이벤트없이_삽입된_PENDING_job을_watchdog가_재수거해_DONE으로_만들고_카드를_만든다() {
        long jobId = insertJob(insertUser(), "PENDING", null, "{\"type\":\"WORD\",\"cropImageRefs\":[\"crop-a.png\"]}");

        watchdog.sweep();

        assertThat(jobStatus(jobId)).isEqualTo("DONE");
        assertThat(cardCount(jobId)).isEqualTo(1);
    }

    @Test
    void lease가_만료된_RUNNING_job을_watchdog가_재수거해_DONE으로_만든다() {
        long jobId = insertJob(insertUser(), "RUNNING", -10,
                "{\"type\":\"WORD\",\"cropImageRefs\":[\"crop-b.png\"]}");

        watchdog.sweep();

        assertThat(jobStatus(jobId)).isEqualTo("DONE");
        assertThat(cardCount(jobId)).isEqualTo(1);
    }

    @Test
    void lease가_살아있는_RUNNING_job은_watchdog가_건드리지_않는다() {
        long jobId = insertJob(insertUser(), "RUNNING", 10,
                "{\"type\":\"WORD\",\"cropImageRefs\":[\"crop-c.png\"]}");

        watchdog.sweep();

        assertThat(jobStatus(jobId)).isEqualTo("RUNNING");   // 다른 워커가 처리 중 — 재수거 대상 아님
        assertThat(cardCount(jobId)).isZero();
    }

    private long insertJob(long userId, String status, Integer leaseMinutesFromNow, String payloadJson) {
        jdbcTemplate.update(
                "INSERT INTO analyze_job (user_id, status, attempts, payload_json) VALUES (?, ?, 0, ?)",
                userId, status, payloadJson);
        Long id = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
        if (leaseMinutesFromNow != null) {
            // lease_until도 DB 시계(NOW(6))로 세팅 — 프로덕션 claim/조회가 NOW(6)로 판정하므로 테스트도 같은 시계를 써 시간대에 흔들리지 않는다.
            jdbcTemplate.update(
                    "UPDATE analyze_job SET lease_until = DATE_ADD(NOW(6), INTERVAL ? MINUTE) WHERE id=?",
                    leaseMinutesFromNow, id);
        }
        return id;
    }

    private String jobStatus(long jobId) {
        return jdbcTemplate.queryForObject("SELECT status FROM analyze_job WHERE id=?", String.class, jobId);
    }

    private int cardCount(long jobId) {
        Integer n = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM card WHERE analyze_job_id=?", Integer.class, jobId);
        return n == null ? 0 : n;
    }
}
