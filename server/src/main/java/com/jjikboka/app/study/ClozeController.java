package com.jjikboka.app.study;

import com.jjikboka.analysis.GeminiClient;
import com.jjikboka.core.card.ClozeRegenerated;
import com.jjikboka.core.card.ClozeService;
import com.jjikboka.shared.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 빈칸 퀴즈 API (Notion API-ID 14·15·16). 인증 필요 — JwtAuthenticationFilter가 실은 userId를 넣는다.
 * 문항 생성은 정답을 숨기고, 답 제출은 서버가 판정해 전이·기록까지 처리하며, 예문 재생성은 AI(analysis)와 core.card를
 * app이 조립한다 — AI 생성기를 core.card에 주입해 슬라이스 경계를 지킨다(13 §2).
 */
@RestController
class ClozeController {

    private final ClozeService clozeService;
    private final ClozeStudyService clozeStudyService;
    private final GeminiClient geminiClient;

    ClozeController(ClozeService clozeService, ClozeStudyService clozeStudyService, GeminiClient geminiClient) {
        this.clozeService = clozeService;
        this.clozeStudyService = clozeStudyService;
        this.geminiClient = geminiClient;
    }

    @GetMapping("/api/study/cloze")
    ResponseEntity<ApiResponse<ClozeGenerateResponse>> generate(
            @AuthenticationPrincipal Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        ClozeGenerateResponse response = new ClozeGenerateResponse(clozeService.getItems(userId, limit));
        return ResponseEntity.ok(ApiResponse.ok(response, "빈칸 퀴즈 문항 생성이 완료되었습니다."));
    }

    @PostMapping("/api/study/cloze/{id}/answer")
    ResponseEntity<ApiResponse<ClozeAnswerResponse>> answer(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @RequestBody ClozeAnswerRequest request) {
        ClozeAnswerResponse response = clozeStudyService.submit(userId, id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "채점이 완료되었습니다."));
    }

    @PostMapping("/api/study/cloze/{id}/regenerate")
    ResponseEntity<ApiResponse<ClozeRegenerated>> regenerate(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id) {
        ClozeRegenerated response = clozeService.regenerate(userId, id, geminiClient::generateExample);
        return ResponseEntity.ok(ApiResponse.ok(response, "새 예문이 생성되었습니다."));
    }
}
