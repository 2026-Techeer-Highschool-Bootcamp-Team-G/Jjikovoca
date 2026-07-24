package com.jjikboka.app.notification;

import java.time.LocalDateTime;

/**
 * 알림 한 건 (GET /api/notifications). 저장형(streak·레벨업)은 id·read가 있고, 복습대기 파생 항목은 id=null·read=false.
 */
public record NotificationResponse(Long id, String type, String message, boolean read, LocalDateTime createdAt) {
}
