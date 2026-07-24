package com.jjikboka.shared.event;

/**
 * 경험치 이벤트 계약 (13 §6). 출석으로 레벨업·연속학습이 일어났음을 알린다 — 지금은 알림 생성 소비자가 쓴다.
 * 도메인 간 공용 계약이라 shared에 둔다(어느 도메인에도 비속 — ArchUnit: shared는 도메인을 모른다).
 */
public final class ExpEvents {

    /** core.stats(ExpService) 발행 — 출석으로 레벨이 올랐다. 소비자가 축하 알림을 만든다. */
    public record LeveledUp(Long userId, int level) {}

    /** core.stats(ExpService) 발행 — 출석으로 연속 학습일이 이어졌다(2일 이상). */
    public record StreakContinued(Long userId, int streakDays) {}

    private ExpEvents() {}
}
