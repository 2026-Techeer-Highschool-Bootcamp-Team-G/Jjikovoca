package com.jjikboka.app.stats;

import com.jjikboka.core.stats.AttendResult;
import com.jjikboka.core.stats.ExpService;
import com.jjikboka.core.stats.ExpSummary;
import com.jjikboka.shared.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 경험치 API (Notion API-ID 18·19·20, F-11·16). 인증 필요 — JwtAuthenticationFilter가 실은 userId를 넣는다.
 * 출석 적립(일 1회 멱등)·경험치 현황·랭킹을 제공한다. 랭킹은 닉네임(auth)+값(core.stats)을 app이 조립(13 §2).
 */
@RestController
class ExpController {

    private final ExpService expService;
    private final RankingFacade rankingFacade;

    ExpController(ExpService expService, RankingFacade rankingFacade) {
        this.expService = expService;
        this.rankingFacade = rankingFacade;
    }

    @PostMapping("/api/exp/attend")
    ResponseEntity<ApiResponse<AttendResult>> attend(@AuthenticationPrincipal Long userId) {
        AttendResult result = expService.attend(userId);
        return ResponseEntity.ok(ApiResponse.ok(result, "출석 체크가 완료되었습니다."));
    }

    @GetMapping("/api/exp/summary")
    ResponseEntity<ApiResponse<ExpSummary>> summary(@AuthenticationPrincipal Long userId) {
        ExpSummary summary = expService.getSummary(userId);
        return ResponseEntity.ok(ApiResponse.ok(summary, "경험치 현황 조회가 완료되었습니다."));
    }

    @GetMapping("/api/exp/ranking")
    ResponseEntity<ApiResponse<RankingResponse>> ranking(
            @AuthenticationPrincipal Long userId,
            @RequestParam(defaultValue = "weekly") String scope) {
        RankingResponse response = rankingFacade.getRanking(scope);
        return ResponseEntity.ok(ApiResponse.ok(response, "랭킹 조회가 완료되었습니다."));
    }
}
