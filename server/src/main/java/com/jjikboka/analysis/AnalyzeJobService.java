package com.jjikboka.analysis;

import org.springframework.stereotype.Service;

/**
 * 분석 작업 생성 (analysis 공개 진입점, API-6 접수). app 조립 레벨이 quota 차감과 한 트랜잭션으로 묶어 호출한다.
 * analyze_job 엔티티는 패키지 비공개 — 밖으로는 생성된 jobId(Long)만 넘긴다(13 §2).
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
}
