package com.jjikboka.app.study;

import com.jjikboka.core.card.MathQueryService;
import com.jjikboka.shared.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 수학 학습 API (Notion API-ID 29). 인증 필요 — JwtAuthenticationFilter가 실은 userId를 넣는다.
 * 복습 대상 PROBLEM 카드를 골격만 내려준다 — 단계 content·정답·해설은 이후 단계 공개(30)·판정(31)에서만. app→core.card 조립(13 §2).
 */
@RestController
class MathController {

    private final MathQueryService mathQueryService;

    MathController(MathQueryService mathQueryService) {
        this.mathQueryService = mathQueryService;
    }

    @GetMapping("/api/study/math")
    ResponseEntity<ApiResponse<MathQueueResponse>> queue(
            @AuthenticationPrincipal Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        MathQueueResponse response = new MathQueueResponse(mathQueryService.getQueue(userId, limit));
        return ResponseEntity.ok(ApiResponse.ok(response, "수학 복습 큐를 불러왔습니다."));
    }
}
