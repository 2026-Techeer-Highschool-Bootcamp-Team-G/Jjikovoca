package com.jjikboka.analysis;

import com.jjikboka.shared.error.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 분석 작업 생성·상태 전이·조회 (analysis 공개 진입점, API-6·39). app 조립 레벨이 접수 시 create를,
 * 워커가 처리 단계마다 mark*를, 폴링이 view를 호출한다. 각 전이는 독립 트랜잭션이라 폴링에 즉시 반영된다.
 * analyze_job 엔티티는 패키지 비공개 — 밖으로는 jobId·상태(DTO)만 넘긴다(13 §2).
 */
@Service
public class AnalyzeJobService {

    private final AnalyzeJobRepository analyzeJobRepository;

    AnalyzeJobService(AnalyzeJobRepository analyzeJobRepository) {
        this.analyzeJobRepository = analyzeJobRepository;
    }

    /**
     * 접수된 분석 작업을 PENDING으로 만들고 jobId를 돌려준다. 트랜잭션은 호출자(app)가 소유하며,
     * quota 차감과 원자적으로 커밋된다 — 차감 성공 후 job INSERT가 실패하면 함께 롤백된다.
     */
    public Long create(Long userId) {
        return analyzeJobRepository.save(AnalyzeJob.pending(userId)).getId();
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
