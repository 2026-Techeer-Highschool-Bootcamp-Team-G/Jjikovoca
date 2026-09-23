package com.jjikboka.app.analysis;

import com.jjikboka.analysis.AnalyzeJobService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 멈춘 분석 job 재수거 watchdog (P1-6, 13 §6 — 내구성의 진실 소스). 주기마다 claimable(PENDING·lease 만료 RUNNING)을
 * 조회해 각각을 claim→처리로 넘긴다. 정상 흐름은 @Async 빠른 경로가 즉시 처리하고, 크래시·이벤트 유실로 멈춘 job만
 * 여기서 되살린다(안전망). 둘 다 같은 claim 관문을 지나므로 정확히 1회만 처리된다.
 *
 * <p>스윕 자체는 후보 조회만 하고, 실제 소유·처리는 {@link AnalysisWorker#processClaimable}가 claim으로 판정한다 —
 * 조회 시점과 처리 시점 사이의 경합(빠른 경로가 이미 집어감)도 claim 원자성이 흡수한다.
 */
@Component
class AnalyzeJobWatchdog {

    private static final Logger log = LoggerFactory.getLogger(AnalyzeJobWatchdog.class);

    private final AnalyzeJobService analyzeJobService;
    private final AnalysisWorker analysisWorker;

    AnalyzeJobWatchdog(AnalyzeJobService analyzeJobService, AnalysisWorker analysisWorker) {
        this.analyzeJobService = analyzeJobService;
        this.analysisWorker = analysisWorker;
    }

    /**
     * 주기 스윕 — 기본 30초(app.analyze.watchdog.interval-ms로 조정). 한 스윕은 후보 배치를 순회하며 각 job을
     * claim 시도한다. claim에 진 후보(빠른 경로가 이미 처리 중)는 조용히 건너뛴다. 한 job의 실패가 스윕 전체를
     * 멈추지 않게 개별 try로 격리한다 — 나머지 후보는 계속 처리된다.
     */
    @Scheduled(fixedDelayString = "${app.analyze.watchdog.interval-ms:30000}",
            initialDelayString = "${app.analyze.watchdog.interval-ms:30000}")
    void sweep() {
        List<Long> claimable = analyzeJobService.findClaimableIds();
        if (claimable.isEmpty()) {
            return;
        }
        log.debug("watchdog 스윕 — claimable {}건 재수거 시도", claimable.size());
        for (Long jobId : claimable) {
            try {
                analysisWorker.processClaimable(jobId);
            } catch (RuntimeException e) {
                log.warn("watchdog job 처리 실패(건너뜀) — jobId={}: {}", jobId, e.getMessage());
            }
        }
    }
}
