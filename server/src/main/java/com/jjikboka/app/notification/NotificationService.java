package com.jjikboka.app.notification;

import com.jjikboka.core.card.CardStatsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 알림 조립 (app-facade, Phase 4). 저장형 알림(streak·레벨업)과 조회 파생 알림(복습대기)을 하나의 목록으로 합친다.
 * 복습대기는 저장하지 않고 조회 시점의 {@link CardStatsService#reviewDue}로 만들어 항상 정확하게 유지한다.
 */
@Service
public class NotificationService {

    private static final String TYPE_REVIEW_DUE = "REVIEW_DUE";

    private final NotificationRepository repository;
    private final CardStatsService cardStatsService;

    NotificationService(NotificationRepository repository, CardStatsService cardStatsService) {
        this.repository = repository;
        this.cardStatsService = cardStatsService;
    }

    /** 목록 — 복습대기 파생 항목(있으면 상단) + 저장형 알림(최신순). */
    @Transactional(readOnly = true)
    public List<NotificationResponse> list(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        List<NotificationResponse> result = new ArrayList<>();

        long due = cardStatsService.reviewDue(userId, now);
        if (due > 0) {
            result.add(new NotificationResponse(null, TYPE_REVIEW_DUE,
                    "복습할 카드 " + due + "개가 기다리고 있어요.", false, now));
        }
        repository.findByUserIdOrderByCreatedAtDesc(userId).forEach(n ->
                result.add(new NotificationResponse(n.getId(), n.getType(), n.getMessage(), n.isRead(), n.getCreatedAt())));
        return result;
    }

    /** 안 읽은 저장형 알림 전체를 읽음 처리(더티 체킹). 파생 항목(복습대기)은 저장이 없어 대상 아님. */
    @Transactional
    public void markAllRead(Long userId) {
        repository.findByUserIdAndReadFalse(userId).forEach(Notification::markRead);
    }

    /** 발생형 알림 생성 (이벤트 리스너가 호출) — streak·레벨업 등. */
    @Transactional
    public void create(Long userId, String type, String message) {
        repository.save(Notification.of(userId, type, message));
    }
}
