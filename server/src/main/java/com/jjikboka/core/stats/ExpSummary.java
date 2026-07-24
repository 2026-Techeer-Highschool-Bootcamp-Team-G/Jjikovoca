package com.jjikboka.core.stats;

/**
 * 경험치 현황 (Notion API-ID 19, core.stats 공개 DTO). 게임형 홈(F-16)의 데이터 소스 —
 * 레벨·경험치·다음 레벨 경험치·오늘 획득·일일 한도·연속 학습일 + 오늘의 퀘스트.
 */
public record ExpSummary(
        int level,
        int exp,
        int nextLevelExp,
        int todayEarned,
        int dailyCap,
        int streakDays,
        Quest quest
) {
}
