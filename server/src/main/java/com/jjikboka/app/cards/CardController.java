package com.jjikboka.app.cards;

import com.jjikboka.core.card.CardQueryService;
import com.jjikboka.shared.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 카드 조회 API (Notion API-ID 7). 인증 필요 — JwtAuthenticationFilter가 실은 userId를 넣는다.
 * 피드는 최신순·soft-delete 제외이고, subject로 과목을 좁힐 수 있다(ALL 기본). app→core.card 조립(13 §2).
 */
@RestController
@RequestMapping("/api/cards")
class CardController {

    private final CardQueryService cardQueryService;

    CardController(CardQueryService cardQueryService) {
        this.cardQueryService = cardQueryService;
    }

    @GetMapping
    ResponseEntity<ApiResponse<CardFeedResponse>> feed(
            @AuthenticationPrincipal Long userId,
            @RequestParam(required = false) String subject) {
        CardFeedResponse response = new CardFeedResponse(cardQueryService.getFeed(userId, subject));
        return ResponseEntity.ok(ApiResponse.ok(response, "카드 목록 조회가 완료되었습니다."));
    }
}
