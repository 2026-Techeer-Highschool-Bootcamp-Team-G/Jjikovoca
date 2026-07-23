package com.jjikboka.app.cards;

import com.jjikboka.shared.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 캡처 분석 API (Notion API-ID 6). 인증 필요 — JwtAuthenticationFilter가 실은 userId를 넣는다.
 * 비동기 접수: quota 차감·job 생성까지 하고 <b>202</b>로 jobId를 돌려준 뒤, 실제 카드 생성은 워커가 이어간다.
 */
@RestController
@RequestMapping("/api/cards")
class AnalyzeController {

    private final AnalyzeService analyzeService;

    AnalyzeController(AnalyzeService analyzeService) {
        this.analyzeService = analyzeService;
    }

    @PostMapping("/analyze")
    ResponseEntity<ApiResponse<AnalyzeAcceptedResponse>> analyze(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody AnalyzeRequest request) {
        AnalyzeAcceptedResponse accepted = analyzeService.submit(userId, request);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.ok(accepted, "분석을 접수했습니다."));
    }
}
