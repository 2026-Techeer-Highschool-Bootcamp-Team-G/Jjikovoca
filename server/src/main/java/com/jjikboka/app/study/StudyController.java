package com.jjikboka.app.study;

import com.jjikboka.core.card.StudyQueueService;
import com.jjikboka.shared.response.ApiResponse;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 학습 API (Notion API-ID 11·12·13). 인증 필요 — JwtAuthenticationFilter가 실은 userId를 넣는다.
 * 복습 활동 결과를 단일 진입점으로 기록(서버가 라이트너 전이 강제)하고, 플래시카드·복습 큐를 제공한다. app→core.card 조립(13 §2).
 */
@RestController
class StudyController {

    private final StudyService studyService;
    private final StudyQueueService studyQueueService;

    StudyController(StudyService studyService, StudyQueueService studyQueueService) {
        this.studyService = studyService;
        this.studyQueueService = studyQueueService;
    }

    @PostMapping("/api/cards/{id}/study")
    ResponseEntity<ApiResponse<StudyResultResponse>> study(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @RequestBody StudyRecordRequest request) {
        StudyResultResponse result = studyService.record(userId, id, request);
        return ResponseEntity.ok(ApiResponse.ok(result, "학습 기록이 저장되었습니다."));
    }

    @GetMapping("/api/study/flashcards")
    ResponseEntity<ApiResponse<FlashcardQueueResponse>> flashcards(
            @AuthenticationPrincipal Long userId,
            @RequestParam(required = false) String subject,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "TODAY") String mode,
            @RequestParam(required = false) List<Long> cardIds) {
        FlashcardQueueResponse response = FlashcardQueueResponse.of(
                studyQueueService.getFlashcards(userId, subject, limit, mode, cardIds));
        return ResponseEntity.ok(ApiResponse.ok(response, "플래시카드 큐 조회가 완료되었습니다."));
    }

    @GetMapping("/api/study/review-queue")
    ResponseEntity<ApiResponse<ReviewQueueResponse>> reviewQueue(
            @AuthenticationPrincipal Long userId,
            @RequestParam(defaultValue = "50") int limit) {
        ReviewQueueResponse response = ReviewQueueResponse.of(
                studyQueueService.getReviewQueue(userId, limit));
        return ResponseEntity.ok(ApiResponse.ok(response, "복습 큐 조회가 완료되었습니다."));
    }
}
