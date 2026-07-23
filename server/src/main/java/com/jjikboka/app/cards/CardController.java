package com.jjikboka.app.cards;

import com.jjikboka.core.card.CardDetail;
import com.jjikboka.core.card.CardQueryService;
import com.jjikboka.shared.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 카드 조회 API (Notion API-ID 7·8). 인증 필요 — JwtAuthenticationFilter가 실은 userId를 넣는다.
 * 피드는 최신순·soft-delete 제외(subject로 과목 좁힘), 상세는 소유자 검증을 서버가 강제한다. app→core.card 조립(13 §2).
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

    @GetMapping("/{id}")
    ResponseEntity<ApiResponse<CardDetail>> detail(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id) {
        CardDetail detail = cardQueryService.getDetail(userId, id);
        return ResponseEntity.ok(ApiResponse.ok(detail, "카드 조회가 완료되었습니다."));
    }
}
