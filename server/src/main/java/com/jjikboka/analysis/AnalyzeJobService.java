package com.jjikboka.analysis;

import com.jjikboka.shared.error.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 분석 작업 생성·상태 전이·조회 (analysis 공개 진입점, API-6·39). app 조립 레벨이 접수 시 create를,
 * 워커가 처리 단계마다 mark*를, 폴링이 view를 호출한다. 각 전이는 독립 트랜잭션이라 폴링에 즉시 반영된다.
 * analyze_job 엔티티는 패키지 비공개 — 밖으로는 jobId·상태(DTO)만 넘긴다(13 §2).
 *
 * <p><b>내구 처리(P1-6)</b>: claim은 조건부 원자 UPDATE로 소유권을 잡아 @Async·watchdog 이중 경로가
 * 동시에 노려도 정확히 1개만 처리하게 한다. lease는 처리 소유 기한이라 워커가 사망하면 만료 후
 * 다른 실행자가 재수거한다. attempts가 상한(N)을 넘으면 워커가 FAILED 확정 + quota 환불한다.
 */
@Service
public class AnalyzeJobService {

    /** 재시도 상한 — 이번 claim까지의 attempts가 이 값을 넘으면 워커가 FAILED 확정 + 환불한다(13 §6). */
    static final int MAX_ATTEMPTS = 3;

    /** lease 기본 기한(초) — 처리 소유권 유지 시간. 넘게 걸리면 사망으로 보고 재수거되므로 처리 상한보다 넉넉히 잡는다. */
    private static final long LEASE_BASE_SECONDS = 120;

    /** watchdog 1회 스윕당 재수거 후보 상한 — 폭주 방지(작은 배치로 점진 처리). */
    static final int CLAIM_BATCH_LIMIT = 20;

    private final AnalyzeJobRepository analyzeJobRepository;

    AnalyzeJobService(AnalyzeJobRepository analyzeJobRepository) {
        this.analyzeJobRepository = analyzeJobRepository;
    }

    /**
     * 접수된 분석 작업을 PENDING으로 만들고 jobId를 돌려준다. 트랜잭션은 호출자(app)가 소유하며,
     * quota 차감과 원자적으로 커밋된다 — 차감 성공 후 job INSERT가 실패하면 함께 롤백된다.
     * payloadJson은 재구성 payload 원문(이벤트 유실 대비 영속화, 없으면 null 허용).
     */
    public Long create(Long userId, String payloadJson) {
        return analyzeJobRepository.save(AnalyzeJob.pending(userId, payloadJson)).getId();
    }

    /** payload 없는 접수(레거시 경로) — 재구성 payload가 없으면 watchdog는 이 job을 재처리하지 못하고 상한 후 FAILED된다. */
    public Long create(Long userId) {
        return create(userId, null);
    }

    /**
     * lease 기반 claim — 조건부 원자 UPDATE로 이 job의 처리 소유권을 잡는다. PENDING 또는 lease 만료 RUNNING일 때만
     * 성공(RUNNING 전이 + lease·attempts 증가)하며, 성공 시에만 처리 컨텍스트를 돌려준다. 경합에 지면 empty.
     * @Async·watchdog가 같은 job을 동시에 claim해도 UPDATE 행 락으로 정확히 1개만 성공한다.
     */
    @Transactional
    public Optional<AnalyzeJobClaim> claim(Long jobId) {
        LocalDateTime now = LocalDateTime.now();
        int claimed = analyzeJobRepository.claim(jobId, now, now.plusSeconds(LEASE_BASE_SECONDS));
        if (claimed == 0) {
            return Optional.empty();   // 다른 실행자가 이미 소유(경합 패배) 또는 종결 상태
        }
        return analyzeJobRepository.findById(jobId)
                .map(job -> new AnalyzeJobClaim(job.getId(), job.getUserId(), job.getPayloadJson(), job.getAttempts()));
    }

    /** watchdog 재수거 후보 id — claimable(PENDING·lease 만료 RUNNING). 소유는 각 후보를 claim해 다시 판정한다. */
    @Transactional(readOnly = true)
    public List<Long> findClaimableIds() {
        return analyzeJobRepository.findClaimableIds(LocalDateTime.now(), CLAIM_BATCH_LIMIT);
    }

    /** 이번 claim의 attempts가 재시도 상한을 넘었는지 — 넘으면 워커가 처리 없이 FAILED 확정 + 환불한다. */
    public boolean isExhausted(int attempts) {
        return attempts > MAX_ATTEMPTS;
    }

    /**
     * 이번 claim이 재시도 상한의 마지막 시도인지 — 처리 중 실패가 나면 재수거를 더 기다리지 않고 즉시 FAILED + 환불한다.
     * (상한 미만이면 사유만 남기고 watchdog 재수거로 다시 시도한다.)
     */
    public boolean isLastAttempt(int attempts) {
        return attempts >= MAX_ATTEMPTS;
    }

    /** 워커 처리 시작 — RUNNING. 각 전이는 독립 트랜잭션으로 즉시 커밋해 폴링에 보이게 한다. */
    @Transactional
    public void markRunning(Long jobId) {
        analyzeJobRepository.findById(jobId).ifPresent(AnalyzeJob::markRunning);
    }

    /** 카드 생성 완료 — DONE. */
    @Transactional
    public void markDone(Long jobId) {
        analyzeJobRepository.findById(jobId).ifPresent(AnalyzeJob::markDone);
    }

    /** 최종 실패 — FAILED. quota 환불은 app 워커가 core.card에 따로 지시한다(사가 보상). */
    @Transactional
    public void markFailed(Long jobId) {
        analyzeJobRepository.findById(jobId).ifPresent(AnalyzeJob::markFailed);
    }

    /**
     * 재시도 상한 초과로 최종 실패 확정 — FAILED + 실패 사유 기록. 워커가 이어서 quota를 환불한다(멱등).
     * 이미 FAILED여도 안전하다(상태만 유지, last_error 갱신).
     */
    @Transactional
    public void markFailedExhausted(Long jobId, String error) {
        analyzeJobRepository.findById(jobId).ifPresent(job -> {
            job.markFailed();
            job.recordError(truncate(error));
        });
    }

    /**
     * 일시적 실패 기록 — 상태는 유지(lease 만료 후 재수거해 재시도)하고 사유만 남긴다. FAILED로 못박지 않는다 —
     * attempts가 상한에 이르기 전엔 watchdog가 되살릴 수 있어야 하므로.
     */
    @Transactional
    public void recordError(Long jobId, String error) {
        analyzeJobRepository.findById(jobId).ifPresent(job -> job.recordError(truncate(error)));
    }

    /** last_error 컬럼(VARCHAR(500)) 상한에 맞춰 자른다 — 스택 메시지가 길어도 저장이 깨지지 않게. */
    private static String truncate(String error) {
        if (error == null) {
            return null;
        }
        return error.length() <= 500 ? error : error.substring(0, 500);
    }

    /**
     * 폴링용 상태 조회 (API-39). 없는 job은 404 JOB_NOT_FOUND, 남의 job은 403으로 서버가 막는다.
     * 상태는 DB 원값으로 넘기고, 표현(COMPLETED 매핑)은 app이 한다.
     */
    @Transactional(readOnly = true)
    public AnalyzeJobView view(Long jobId, Long userId) {
        AnalyzeJob job = analyzeJobRepository.findById(jobId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "JOB_NOT_FOUND", "분석 작업을 찾을 수 없습니다."));
        if (!job.getUserId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "FORBIDDEN", "접근 권한이 없습니다.");
        }
        return new AnalyzeJobView(job.getId(), job.getStatus());
    }
}
