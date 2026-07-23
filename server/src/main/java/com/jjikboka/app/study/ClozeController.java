package com.jjikboka.app.study;

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
 * 빈칸 퀴즈 API (Notion API-ID 14·15). 인증 필요 — JwtAuthenticationFilter가 실은 userId를 넣는다.
 * 문항 생성은 정답을 숨기고, 답 제출은 서버가 판정해 라이트너 전이·기록까지 한 번에 처리한다. app→core 조립(13 §2).
 */
@RestController
class ClozeController {

    private final ClozeService clozeService;
    private final ClozeStudyService clozeStudyService;

    ClozeController(ClozeService clozeService, ClozeStudyService clozeStudyService) {
        this.clozeService = clozeService;
        this.clozeStudyService = clozeStudyService;
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
}
