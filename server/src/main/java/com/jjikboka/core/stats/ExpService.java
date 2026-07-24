package com.jjikboka.core.stats;

import com.jjikboka.shared.event.ExpEvents;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * 경험치 (core.stats 공개 진입점, API-18·19). 출석 적립(멱등)과 현황 조회를 맡는다 — user_stat 상태 + exp_log 원장.
 * 적립은 서버 내부 규칙(일 1회·일일 한도)이며, 밸런스 수치는 placeholder(기획 확정 전).
 */
@Service
public class ExpService {

    private static final String SOURCE_ATTEND = "ATTEND";
    private static final int ATTEND_EXP = 10;
    private static final int DAILY_CAP = 100;

    private final UserStatRepository userStatRepository;
    private final ExpLogRepository expLogRepository;
    private final ApplicationEventPublisher eventPublisher;

    ExpService(UserStatRepository userStatRepository, ExpLogRepository expLogRepository,
               ApplicationEventPublisher eventPublisher) {
        this.userStatRepository = userStatRepository;
        this.expLogRepository = expLogRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * 출석 체크(API-18) — 일 1회 멱등. 오늘 이미 출석했으면 earned 0으로 그대로 돌려준다(에러 아님).
     * 일일 한도(DAILY_CAP)를 넘기면 출석·streak은 기록하되 earned는 0이 된다.
     */
    @Transactional
    public AttendResult attend(Long userId) {
        LocalDate today = LocalDate.now();
        UserStat stat = userStatRepository.findById(userId).orElseGet(() -> UserStat.of(userId));

        if (today.equals(stat.getLastAttendDate())) {
            return new AttendResult(0, stat.getExp(), false, stat.getStreakDays());   // 재호출 멱등
        }

        int newStreak = today.minusDays(1).equals(stat.getLastAttendDate()) ? stat.getStreakDays() + 1 : 1;
        int todaySum = expLogRepository.sumEarnedOn(userId, today);
        int earned = Math.max(0, Math.min(ATTEND_EXP, DAILY_CAP - todaySum));
        if (earned > 0) {
            expLogRepository.save(ExpLog.of(userId, SOURCE_ATTEND, earned, today));
        }
        boolean levelUp = stat.attend(earned, newStreak, today);
        userStatRepository.save(stat);

        // 알림 소비자에게 신호(AFTER_COMMIT). 롤백되면 알림도 안 생기도록 커밋 이후 처리한다.
        if (levelUp) {
            eventPublisher.publishEvent(new ExpEvents.LeveledUp(userId, stat.getLevel()));
        }
        if (newStreak >= 2) {
            eventPublisher.publishEvent(new ExpEvents.StreakContinued(userId, newStreak));
        }
        return new AttendResult(earned, stat.getExp(), levelUp, newStreak);
    }

    /** 경험치 현황(API-19). 통계 행이 없으면 기본 상태(레벨 1)로 응답한다. 오늘의 퀘스트=일일 XP 목표 진행도. */
    @Transactional(readOnly = true)
    public ExpSummary getSummary(Long userId) {
        UserStat stat = userStatRepository.findById(userId).orElseGet(() -> UserStat.of(userId));
        int todayEarned = expLogRepository.sumEarnedOn(userId, LocalDate.now());
        Quest quest = new Quest("오늘의 학습 목표", todayEarned, DAILY_CAP, todayEarned >= DAILY_CAP);
        return new ExpSummary(stat.getLevel(), stat.getExp(), stat.nextLevelExp(),
                todayEarned, DAILY_CAP, stat.getStreakDays(), quest);
    }
}
