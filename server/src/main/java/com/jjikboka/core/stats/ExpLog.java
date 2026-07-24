package com.jjikboka.core.stats;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

/**
 * 경험치 원장 (03 exp_log, F-11). INSERT-only — 적립 사유·양·획득일을 남긴다(CAPTURE/CORRECT/ATTEND/GOAL/GROWTH).
 * 일일 한도·주간 랭킹 집계의 근거. @Entity는 core.stats 밖에서 비공개(13 §2).
 */
@Entity
@Table(name = "exp_log")
class ExpLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private int amount;

    @Column(name = "earn_date", nullable = false)
    private LocalDate earnDate;

    protected ExpLog() {
    }

    static ExpLog of(Long userId, String source, int amount, LocalDate earnDate) {
        ExpLog log = new ExpLog();
        log.userId = userId;
        log.source = source;
        log.amount = amount;
        log.earnDate = earnDate;
        return log;
    }
}
