package com.jjikboka.core.stats;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jjikboka.core.review.StudyStats;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 월 스냅샷 upsert (API-17, F-10). 완료된 과거 월의 리포트 집계를 report_monthly에 durable하게 남긴다.
 * user_id+period가 UNIQUE라 존재하면 갱신, 없으면 생성 — 재조회해도 중복이 생기지 않는다(멱등).
 *
 * <p>리포트 조회는 readOnly 트랜잭션이라, 스냅샷 쓰기는 {@code REQUIRES_NEW}로 분리해 독립 커밋한다(읽기 성격 유지).
 * accuracy는 DECIMAL(3,2) 정합을 위해 BigDecimal(소수 2자리)로 변환하고, reason_breakdown은 JSON 문자열로 저장한다.
 */
@Service
public class ReportSnapshotService {

    private final ReportMonthlyRepository reportMonthlyRepository;
    private final ObjectMapper objectMapper;

    ReportSnapshotService(ReportMonthlyRepository reportMonthlyRepository, ObjectMapper objectMapper) {
        this.reportMonthlyRepository = reportMonthlyRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void snapshot(Long userId, String period, ReportBasic basic, StudyStats stats, long graduated) {
        ReportMonthly snapshot = reportMonthlyRepository.findByUserIdAndPeriod(userId, period)
                .orElseGet(() -> ReportMonthly.of(userId, period));
        snapshot.apply(
                (int) basic.newCards(),
                (int) basic.studyCount(),
                toDecimal(basic.accuracy().word()),
                toDecimal(basic.accuracy().problem()),
                (int) graduated,
                toJson(stats.reasonBreakdown()));
        reportMonthlyRepository.save(snapshot);
    }

    private BigDecimal toDecimal(Double ratio) {
        return ratio == null ? null : BigDecimal.valueOf(ratio).setScale(2, RoundingMode.HALF_UP);
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}
