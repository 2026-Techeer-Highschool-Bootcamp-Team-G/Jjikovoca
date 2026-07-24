package com.jjikboka.app.stats;

import com.jjikboka.core.stats.AttendResult;
import com.jjikboka.core.stats.ExpService;
import com.jjikboka.core.stats.ExpSummary;
import com.jjikboka.shared.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 경험치 API (Notion API-ID 18·19, F-11·16). 인증 필요 — JwtAuthenticationFilter가 실은 userId를 넣는다.
 * 출석 적립(일 1회 멱등)과 경험치 현황을 제공한다. app→core.stats 조립(13 §2).
 */
@RestController
class ExpController {

    private final ExpService expService;

    ExpController(ExpService expService) {
        this.expService = expService;
    }

    @PostMapping("/api/exp/attend")
    ResponseEntity<ApiResponse<AttendResult>> attend(@AuthenticationPrincipal Long userId) {
        AttendResult result = expService.attend(userId);
        return ResponseEntity.ok(ApiResponse.ok(result, "출석 체크가 완료되었습니다."));
    }

    @GetMapping("/api/exp/summary")
    ResponseEntity<ApiResponse<ExpSummary>> summary(@AuthenticationPrincipal Long userId) {
        ExpSummary summary = expService.getSummary(userId);
        return ResponseEntity.ok(ApiResponse.ok(summary, "경험치 현황 조회가 완료되었습니다."));
    }
}
