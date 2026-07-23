package com.jjikboka.app.cards;

import com.jjikboka.shared.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 캡처 분석 API (Notion API-ID 6·39). 인증 필요 — JwtAuthenticationFilter가 실은 userId를 넣는다.
 * 비동기 접수(202)로 jobId를 돌려준 뒤 워커가 카드를 만들고, 폴링으로 상태·생성 카드를 받아간다.
 */
@RestController
@RequestMapping("/api/cards")
class AnalyzeController {

    private final AnalyzeService analyzeService;
    private final AnalyzePollingService analyzePollingService;

    AnalyzeController(AnalyzeService analyzeService, AnalyzePollingService analyzePollingService) {
        this.analyzeService = analyzeService;
        this.analyzePollingService = analyzePollingService;
    }

    @PostMapping("/analyze")
    ResponseEntity<ApiResponse<AnalyzeAcceptedResponse>> analyze(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody AnalyzeRequest request) {
        AnalyzeAcceptedResponse accepted = analyzeService.submit(userId, request);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.ok(accepted, "분석을 접수했습니다."));
    }

    @GetMapping("/analyze/{jobId}")
    ResponseEntity<ApiResponse<AnalyzeJobResponse>> poll(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long jobId) {
        AnalyzeJobResponse response = analyzePollingService.poll(userId, jobId);
        return ResponseEntity.ok(ApiResponse.ok(response, messageFor(response.status())));
    }

    private String messageFor(String status) {
        return switch (status) {
            case "COMPLETED" -> "분석이 완료되었습니다.";
            case "FAILED" -> "분석에 실패했습니다.";
            default -> "분석을 처리 중입니다.";
        };
    }
}
