package com.jjikboka.core.review;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 월간 학습 집계 (API-17, core.review 공개 DTO). study_log에서 뽑은 원장 통계 — core.stats가 리포트로 조합한다.
 * accuracyWord/accuracyProblem은 데이터가 없으면 null(정확도 미산출). grass는 일자별 학습 수.
 */
public record StudyStats(
        long studyCount,
        Double accuracyWord,
        Double accuracyProblem,
        Map<String, Long> reasonBreakdown,
        List<GrassPoint> grass
) {

    /** 잔디 한 점(일자·학습 수). */
    public record GrassPoint(LocalDate date, long count) {
    }
}
