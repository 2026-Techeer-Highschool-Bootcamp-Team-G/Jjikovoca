package com.jjikboka.app.notification;

import com.jjikboka.shared.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 알림 API (프론트 §1). 인증 필요 — JwtAuthenticationFilter가 실은 userId를 쓴다.
 * 목록은 저장형 + 복습대기 파생 합침, 읽음 처리는 저장형 대상.
 */
@RestController
@RequestMapping("/api/notifications")
class NotificationController {

    private final NotificationService notificationService;

    NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    ResponseEntity<ApiResponse<List<NotificationResponse>>> list(@AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.list(userId)));
    }

    @PostMapping("/read")
    ResponseEntity<ApiResponse<Void>> readAll(@AuthenticationPrincipal Long userId) {
        notificationService.markAllRead(userId);
        return ResponseEntity.ok(ApiResponse.ok(null, "모든 알림을 읽음 처리했습니다."));
    }
}
