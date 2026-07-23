package com.jjikboka.app.cards;

import com.jjikboka.analysis.AnalyzeJobService;
import com.jjikboka.analysis.AnalyzeJobView;
import com.jjikboka.core.card.CardQueryService;
import org.springframework.stereotype.Service;

/**
 * 분석 작업 폴링 조립 (API-39, app 파사드). analysis(job 상태·소유자 검증)와 core.card(생성 카드)를 엮는다.
 * DB 상태 DONE을 응답용 COMPLETED로 옮기는 표현 매핑도 여기서 한다(슬라이스는 원값만 안다).
 *
 * <p>모의 단계 단순화: model은 "mock" 고정, 실패 사유는 공통 메시지 — 실 전환 시 job에 model·error를 영속해 대체.
 */
@Service
class AnalyzePollingService {

    private static final String MOCK_MODEL = "mock";
    private static final String FAIL_MESSAGE = "AI 분석에 실패했어요. 잠시 후 다시 시도해 주세요.";

    private final AnalyzeJobService analyzeJobService;
    private final CardQueryService cardQueryService;

    AnalyzePollingService(AnalyzeJobService analyzeJobService, CardQueryService cardQueryService) {
        this.analyzeJobService = analyzeJobService;
        this.cardQueryService = cardQueryService;
    }

    AnalyzeJobResponse poll(Long userId, Long jobId) {
        AnalyzeJobView view = analyzeJobService.view(jobId, userId);   // 404 JOB_NOT_FOUND · 403
        return switch (view.status()) {
            case "DONE" -> AnalyzeJobResponse.completed(cardQueryService.getCardsByJob(userId, jobId), MOCK_MODEL);
            case "FAILED" -> AnalyzeJobResponse.failed(FAIL_MESSAGE);
            default -> AnalyzeJobResponse.inProgress(view.status());   // PENDING · RUNNING
        };
    }
}
