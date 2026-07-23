package com.jjikboka.app.study;

import com.jjikboka.core.card.CardReviewState;
import com.jjikboka.shared.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * 학습 API (Notion API-ID 11). 인증 필요 — JwtAuthenticationFilter가 실은 userId를 넣는다.
 * 모든 복습 활동(재풀이·플래시카드·빈칸·수학)의 결과를 이 단일 진입점으로 기록하고, 서버가 라이트너 전이를 강제한다.
 */
@RestController
class StudyController {

    private final StudyService studyService;

    StudyController(StudyService studyService) {
        this.studyService = studyService;
    }

    @PostMapping("/api/cards/{id}/study")
    ResponseEntity<ApiResponse<CardReviewState>> study(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @RequestBody StudyRecordRequest request) {
        CardReviewState state = studyService.record(userId, id, request);
        return ResponseEntity.ok(ApiResponse.ok(state, "학습 기록이 저장되었습니다."));
    }
}
