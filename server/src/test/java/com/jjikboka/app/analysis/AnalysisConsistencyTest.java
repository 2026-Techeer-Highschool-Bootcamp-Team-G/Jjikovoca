package com.jjikboka.app.analysis;

import com.jjikboka.core.card.QuotaConsumeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 분석 처리 정합성 (P1-6 커밋5). 크래시 재수거·정확히 1회·중복 재처리·lease 만료 재처리·attempts 초과→FAILED+환불을
 * 실 MySQL로 못박는다. claim 원자성 + 멱등 카드 가드 + 재시도 상한이 함께 "정확히 1회 최종 상태·카드 1회"를 보장하는지 검증한다.
 */
class AnalysisConsistencyTest extends AnalysisWorkerTestSupport {

    @Autowired
    private AnalysisWorker analysisWorker;

    @Autowired
    private QuotaConsumeService quotaConsumeService;

    @Autowired
    private TransactionTemplate txTemplate;

    @Test
    void 정상_처리는_DONE에_도달하고_카드는_정확히_1개다() {
        long jobId = insertJob("PENDING", null, 0, insertUser(), "{\"type\":\"WORD\",\"cropImageRefs\":[\"c1.png\"]}");

        analysisWorker.processClaimable(jobId);

        assertThat(jobStatus(jobId)).isEqualTo("DONE");
        assertThat(cardCount(jobId)).isEqualTo(1);
    }

    @Test
    void 완료된_job을_다시_처리해도_카드가_늘지_않는다_정확히_1회() {
        long jobId = insertJob("PENDING", null, 0, insertUser(), "{\"type\":\"WORD\",\"cropImageRefs\":[\"c2.png\"]}");
        analysisWorker.processClaimable(jobId);   // 1회차 → DONE + 카드 1

        // DONE은 claimable이 아니라 2회차는 곧장 반환된다(정확히 1회) — 카드도 그대로 1개.
        analysisWorker.processClaimable(jobId);

        assertThat(jobStatus(jobId)).isEqualTo("DONE");
        assertThat(cardCount(jobId)).isEqualTo(1);
    }

    @Test
    void 처리_도중_크래시로_다시_claimable해진_job을_재처리해도_카드는_1개다_멱등() {
        long jobId = insertJob("PENDING", null, 0, insertUser(), "{\"type\":\"WORD\",\"cropImageRefs\":[\"c3.png\"]}");
        analysisWorker.processClaimable(jobId);   // 카드 1 생성 + DONE

        // 완료 뒤에도 유실·중복 전달로 다시 claimable해진 상황을 흉내낸다(RUNNING + lease 만료).
        jdbcTemplate.update("UPDATE analyze_job SET status='RUNNING', lease_until=DATE_SUB(NOW(6), INTERVAL 10 MINUTE), attempts=1 WHERE id=?",
                jobId);

        analysisWorker.processClaimable(jobId);   // 재claim해 재분석 — 멱등 가드가 중복 카드를 막는다

        assertThat(jobStatus(jobId)).isEqualTo("DONE");
        assertThat(cardCount(jobId)).isEqualTo(1);   // (job, crop) 가드로 여전히 1개
    }

    @Test
    void lease_만료_RUNNING을_재처리하면_DONE에_도달하고_카드_1개다() {
        long jobId = insertJob("RUNNING", -10, 1, insertUser(),
                "{\"type\":\"WORD\",\"cropImageRefs\":[\"c4.png\"]}");

        analysisWorker.processClaimable(jobId);

        assertThat(jobStatus(jobId)).isEqualTo("DONE");
        assertThat(cardCount(jobId)).isEqualTo(1);
    }

    @Test
    void attempts_상한을_넘긴_claim은_처리없이_FAILED가_되고_quota를_환불한다() {
        long userId = insertUser();
        // 이 사용자로 분석 1회 접수(차감)했다고 가정 — 최종 실패 시 이 차감이 되돌아와야 한다.
        txTemplate.executeWithoutResult(s -> quotaConsumeService.consume(userId));
        assertThat(usedCount(userId)).isEqualTo(1);

        // attempts가 이미 상한(3)이라 이번 claim은 4가 되어 처리 없이 최종 실패로 간다.
        long jobId = insertJob("PENDING", null, 3, userId, "{\"type\":\"WORD\",\"cropImageRefs\":[\"c5.png\"]}");

        analysisWorker.processClaimable(jobId);

        assertThat(jobStatus(jobId)).isEqualTo("FAILED");
        assertThat(cardCount(jobId)).isZero();          // 처리하지 않았으니 카드도 없다
        assertThat(usedCount(userId)).isZero();         // quota 환불(사가 보상)

        // 다시 처리를 시도해도 FAILED는 claimable이 아니라 환불이 중복되지 않는다(멱등).
        analysisWorker.processClaimable(jobId);
        assertThat(usedCount(userId)).isZero();
    }

    private long insertJob(String status, Integer leaseMinutesFromNow, int attempts, long userId, String payloadJson) {
        jdbcTemplate.update(
                "INSERT INTO analyze_job (user_id, status, attempts, payload_json) VALUES (?, ?, ?, ?)",
                userId, status, attempts, payloadJson);
        Long id = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
        if (leaseMinutesFromNow != null) {
            // lease_until도 DB 시계(NOW(6))로 세팅 — 프로덕션 claim/조회가 NOW(6)로 판정하므로 같은 시계를 써 시간대에 흔들리지 않는다.
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

    private int usedCount(long userId) {
        Integer n = jdbcTemplate.queryForObject(
                "SELECT used_count FROM user_quota_daily WHERE user_id=? AND quota_date=?",
                Integer.class, userId, LocalDate.now());
        return n == null ? 0 : n;
    }
}
