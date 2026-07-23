package com.jjikboka.app.exam;

import com.jjikboka.shared.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 시험 API (Notion API-ID 32~35·45·42, F-19). 인증 필요 — JwtAuthenticationFilter가 실은 userId를 넣는다.
 * 등록·수정·삭제 시 시험일 역산 재배치, 넛지 일괄 태깅, 시험 대비 오늘 복습을 제공한다. app→core 조립(13 §2).
 */
@RestController
@RequestMapping("/api/exams")
class ExamController {

    private final ExamFacade examFacade;
    private final ExamReviewFacade examReviewFacade;

    ExamController(ExamFacade examFacade, ExamReviewFacade examReviewFacade) {
        this.examFacade = examFacade;
        this.examReviewFacade = examReviewFacade;
    }

    @GetMapping
    ResponseEntity<ApiResponse<ExamListResponse>> list(@AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(examFacade.list(userId), "시험 목록 조회가 완료되었습니다."));
    }

    @PostMapping
    ResponseEntity<ApiResponse<ExamResponse>> create(
            @AuthenticationPrincipal Long userId,
            @RequestBody ExamCreateRequest request) {
        ExamResponse response = examFacade.create(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "시험이 등록되었습니다. 시험일에 맞춰 복습 일정을 다시 짰어요."));
    }

    @PatchMapping("/{id}")
    ResponseEntity<ApiResponse<ExamResponse>> update(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @RequestBody ExamUpdateRequest request) {
        ExamResponse response = examFacade.update(userId, id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "시험 정보가 수정되었습니다."));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<ApiResponse<ExamDeleteResponse>> delete(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id) {
        ExamDeleteResponse response = examFacade.delete(userId, id);
        return ResponseEntity.ok(ApiResponse.ok(response, "시험이 삭제되었습니다."));
    }

    @PostMapping("/{id}/tag-recent")
    ResponseEntity<ApiResponse<TagRecentResponse>> tagRecent(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @RequestBody TagRecentRequest request) {
        TagRecentResponse response = examReviewFacade.tagRecent(userId, id, request);
        return ResponseEntity.ok(ApiResponse.ok(response,
                response.taggedCount() + "개 카드를 시험에 태깅했습니다."));
    }

    @GetMapping("/{id}/today")
    ResponseEntity<ApiResponse<ExamReviewResponse>> today(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @RequestParam(defaultValue = "20") int limit) {
        ExamReviewResponse response = examReviewFacade.today(userId, id, limit);
        return ResponseEntity.ok(ApiResponse.ok(response, "시험 대비 복습 큐를 불러왔습니다."));
    }
}
