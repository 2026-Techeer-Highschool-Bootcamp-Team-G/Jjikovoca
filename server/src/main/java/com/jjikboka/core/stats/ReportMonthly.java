package com.jjikboka.core.stats;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 월간 리포트 스냅샷 (03 report_monthly). 완료된 과거 월의 집계를 durable하게 보존한다 — study_log 원장이 커지거나
 * 아카이브돼도 과거 월 요약이 남는다. @Entity는 core.stats 밖에서 비공개(13 §2), 갱신은 upsert(멱등, user_id+period UNIQUE).
 *
 * <p>accuracy·avg는 DECIMAL 컬럼이라 {@link BigDecimal}로 매핑한다(스키마 validate 정합). minutes·subject 도넛은
 * 현 집계에 없어 기본값/NULL로 둔다(후속에 채운다).
 */
@Entity
@Table(name = "report_monthly")
class ReportMonthly {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String period;

    @Column(name = "new_cards")
    private int newCards;

    @Column(name = "study_count")
    private int studyCount;

    @Column(name = "accuracy_word", precision = 3, scale = 2)
    private BigDecimal accuracyWord;

    @Column(name = "accuracy_problem", precision = 3, scale = 2)
    private BigDecimal accuracyProblem;

    @Column(name = "graduated_count")
    private int graduatedCount;

    @Column(name = "study_minutes")
    private int studyMinutes;

    @Column(name = "avg_session_minutes", precision = 5, scale = 1)
    private BigDecimal avgSessionMinutes;

    @Column(name = "subject_study_minutes", columnDefinition = "json")
    private String subjectStudyMinutes;

    @Column(name = "reason_breakdown", columnDefinition = "json")
    private String reasonBreakdown;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    protected ReportMonthly() {
    }

    static ReportMonthly of(Long userId, String period) {
        ReportMonthly snapshot = new ReportMonthly();
        snapshot.userId = userId;
        snapshot.period = period;
        return snapshot;
    }

    /** 집계값으로 갱신한다(upsert 시 기존 행에 덮어쓰기). accuracy는 null 허용(대상 없음). */
    void apply(int newCards, int studyCount, BigDecimal accuracyWord, BigDecimal accuracyProblem,
               int graduatedCount, String reasonBreakdown) {
        this.newCards = newCards;
        this.studyCount = studyCount;
        this.accuracyWord = accuracyWord;
        this.accuracyProblem = accuracyProblem;
        this.graduatedCount = graduatedCount;
        this.reasonBreakdown = reasonBreakdown;
    }

    Long getId() {
        return id;
    }

    String getPeriod() {
        return period;
    }
}
