package com.jjikboka.app.study;

import com.jjikboka.core.card.MathJudgeResult;
import com.jjikboka.core.card.MathQueryService;
import com.jjikboka.core.card.MathStepReveal;
import com.jjikboka.shared.error.BusinessException;
import com.jjikboka.shared.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 수학 학습 API (Notion API-ID 29·30·31). 인증 필요 — JwtAuthenticationFilter가 실은 userId를 넣는다.
 * 복습 큐는 골격만, 단계 공개(30)는 content를, 정답 판정(31)은 채점 후 정답·해설을 드러낸다. app→core.card 조립(13 §2).
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

    @PostMapping("/api/study/math/{cardId}/steps/{no}")
    ResponseEntity<ApiResponse<MathStepReveal>> revealStep(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long cardId,
            @PathVariable int no,
            @RequestParam(defaultValue = "0") int solutionIndex) {
        MathStepReveal reveal = mathQueryService.revealStep(userId, cardId, no, solutionIndex);
        return ResponseEntity.ok(ApiResponse.ok(reveal, "단계가 공개되었습니다."));
    }

    @PostMapping("/api/study/math/{cardId}/answer")
    ResponseEntity<ApiResponse<MathJudgeResult>> answer(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long cardId,
            @RequestBody MathAnswerRequest request) {
        if (request.answer() == null || request.answer().isBlank()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "MISSING_ANSWER", "답을 입력해 주세요.");
        }
        MathJudgeResult result = mathQueryService.judge(userId, cardId, request.answer());
        return ResponseEntity.ok(ApiResponse.ok(result, "채점이 완료되었습니다."));
    }
}
