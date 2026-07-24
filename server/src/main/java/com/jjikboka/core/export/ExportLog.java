package com.jjikboka.core.export;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * 내보내기 기록 (03 export_log, F-07). 생성 요청의 종류·대상 카드 수를 남긴다 — 파일 자체는 별도 저장(id로 키잉).
 * @Entity는 core.export 밖에서 비공개 — 노출은 조회 서비스로만(13 §2).
 */
@Entity
@Table(name = "export_log")
class ExportLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String type;

    @Column(name = "card_count", nullable = false)
    private int cardCount;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    protected ExportLog() {
    }

    static ExportLog of(Long userId, String type, int cardCount) {
        ExportLog log = new ExportLog();
        log.userId = userId;
        log.type = type;
        log.cardCount = cardCount;
        return log;
    }

    Long getId() {
        return id;
    }

    Long getUserId() {
        return userId;
    }
}
