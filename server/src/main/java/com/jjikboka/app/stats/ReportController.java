package com.jjikboka.app.stats;

import com.jjikboka.core.stats.ReportService;
import com.jjikboka.core.stats.ReportView;
import com.jjikboka.shared.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 리포트 API (Notion API-ID 17, F-10·12). 인증 필요 — JwtAuthenticationFilter가 실은 userId를 넣는다.
 * 월간 학습·카드 집계를 리포트로 내려준다(full은 프리미엄만). app→core.stats 조립(13 §2).
 */
@RestController
class ReportController {

    private final ReportService reportService;

    ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/api/reports/summary")
    ResponseEntity<ApiResponse<ReportView>> summary(
            @AuthenticationPrincipal Long userId,
            @RequestParam(required = false) String period) {
        ReportView report = reportService.getMonthlyReport(userId, period);
        return ResponseEntity.ok(ApiResponse.ok(report, "리포트 조회가 완료되었습니다."));
    }
}
