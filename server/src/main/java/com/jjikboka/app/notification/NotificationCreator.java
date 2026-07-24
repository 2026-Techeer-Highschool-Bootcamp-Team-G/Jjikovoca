package com.jjikboka.app.notification;

import com.jjikboka.shared.event.ExpEvents;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * 발생형 알림 생성 (13 §6, Phase 4). 경험치 이벤트를 받아 notification 행을 만든다 —
 * 커밋 이후(AFTER_COMMIT)에만 생성해, 출석이 롤백되면 알림도 남지 않게 한다({@link com.jjikboka.core.stats.ReportCacheEvictor}와 같은 패턴).
 * 리스너는 원 트랜잭션 밖에서 돌고, 생성은 {@link NotificationService#create}의 새 트랜잭션에서 처리된다.
 */
@Component
class NotificationCreator {

    private final NotificationService notificationService;

    NotificationCreator(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void onLeveledUp(ExpEvents.LeveledUp event) {
        notificationService.create(event.userId(), "LEVEL_UP", "레벨 " + event.level() + " 달성! 🎉");
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void onStreakContinued(ExpEvents.StreakContinued event) {
        notificationService.create(event.userId(), "STREAK", event.streakDays() + "일 연속 학습 중이에요! 🔥");
    }
}
