package com.jjikboka.app.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * notification 저장소. package-private 봉인 — 저장형 알림(streak·레벨업)의 최신순 조회·미읽음 조회.
 */
interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUserIdAndReadFalse(Long userId);
}
