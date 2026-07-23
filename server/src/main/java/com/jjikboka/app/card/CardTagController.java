package com.jjikboka.app.card;

import com.jjikboka.shared.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * 카드 시험 태깅 API (Notion API-ID 43·44, F-29). 인증 필요 — JwtAuthenticationFilter가 실은 userId를 넣는다.
 * 카드를 시험 범위에 넣고(멱등·다대다) 뺀다. 카드·시험 소유는 서버가 각 슬라이스로 강제한다. app→core 조립(13 §2).
 */
@RestController
class CardTagController {

    private final CardTagFacade cardTagFacade;

    CardTagController(CardTagFacade cardTagFacade) {
        this.cardTagFacade = cardTagFacade;
    }

    @PostMapping("/api/cards/{id}/exams")
    ResponseEntity<ApiResponse<CardTagResponse>> tag(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @RequestBody CardTagRequest request) {
        CardTagResponse response = cardTagFacade.tag(userId, id, request.examIds());
        return ResponseEntity.ok(ApiResponse.ok(response, "시험에 태깅되었습니다."));
    }

    @DeleteMapping("/api/cards/{id}/exams/{examId}")
    ResponseEntity<ApiResponse<CardUntagResponse>> untag(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @PathVariable Long examId) {
        CardUntagResponse response = cardTagFacade.untag(userId, id, examId);
        return ResponseEntity.ok(ApiResponse.ok(response, "시험 범위에서 제외되었습니다."));
    }
}
