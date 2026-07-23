package com.jjikboka.core.stats;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

/**
 * 사용자 통계 (03 user_stat, F-11). 경험치·레벨·연속 학습일을 든다 — 게이미피케이션의 상태.
 * 레벨은 exp에서 파생(EXP_PER_LEVEL 커브, 밸런스 기획 전 placeholder). @Entity는 core.stats 밖에서 비공개(13 §2).
 */
@Entity
@Table(name = "user_stat")
class UserStat {

    /** 레벨 1당 필요 경험치(placeholder — 밸런스 기획에서 확정). */
    static final int EXP_PER_LEVEL = 100;

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private int exp;

    @Column(nullable = false)
    private int level;

    @Column(name = "streak_days", nullable = false)
    private int streakDays;

    @Column(name = "last_attend_date")
    private LocalDate lastAttendDate;

    protected UserStat() {
    }

    /** 아직 통계 행이 없는 사용자의 기본 상태(레벨 1). 첫 적립 시 저장된다. */
    static UserStat of(Long userId) {
        UserStat stat = new UserStat();
        stat.userId = userId;
        stat.exp = 0;
        stat.level = 1;
        stat.streakDays = 0;
        return stat;
    }

    /**
     * 출석 반영(API-18) — earned만큼 경험치를 더하고 레벨을 재계산, streak·마지막 출석일을 갱신한다.
     * 레벨이 올랐는지 반환한다(levelUp).
     */
    boolean attend(int earned, int newStreak, LocalDate today) {
        int previousLevel = level;
        exp += earned;
        level = exp / EXP_PER_LEVEL + 1;
        streakDays = newStreak;
        lastAttendDate = today;
        return level > previousLevel;
    }

    int getExp() {
        return exp;
    }

    int getLevel() {
        return level;
    }

    int getStreakDays() {
        return streakDays;
    }

    LocalDate getLastAttendDate() {
        return lastAttendDate;
    }

    /** 다음 레벨 도달에 필요한 누적 경험치(placeholder 커브). */
    int nextLevelExp() {
        return level * EXP_PER_LEVEL;
    }
}
