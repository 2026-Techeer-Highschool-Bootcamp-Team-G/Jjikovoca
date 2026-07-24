package com.jjikboka.core.stats;

import com.jjikboka.core.card.CardStatsService;
import com.jjikboka.core.review.StudyStatsService;
import com.jjikboka.shared.event.ExpEvents;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 경험치 (core.stats 공개 진입점, API-18·19). 출석·학습·캡처 적립과 현황 조회를 맡는다 — user_stat 상태 + exp_log 원장.
 * 적립은 서버 내부 규칙(일일 한도)이며, 밸런스 수치는 placeholder(기획 확정 전). 오늘의 퀘스트는 복습 진행도(core.card·core.review 조합).
 */
@Service
public class ExpService {

    private static final String SOURCE_ATTEND = "ATTEND";
    private static final String SOURCE_CORRECT = "CORRECT";
    private static final String SOURCE_CAPTURE = "CAPTURE";
    private static final int ATTEND_EXP = 10;
    private static final int STUDY_EXP = 5;
    private static final int CAPTURE_EXP = 3;
    private static final int DAILY_CAP = 100;

    private final UserStatRepository userStatRepository;
    private final ExpLogRepository expLogRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final CardStatsService cardStatsService;
    private final StudyStatsService studyStatsService;

    ExpService(UserStatRepository userStatRepository, ExpLogRepository expLogRepository,
               ApplicationEventPublisher eventPublisher,
               CardStatsService cardStatsService, StudyStatsService studyStatsService) {
        this.userStatRepository = userStatRepository;
        this.expLogRepository = expLogRepository;
        this.eventPublisher = eventPublisher;
        this.cardStatsService = cardStatsService;
        this.studyStatsService = studyStatsService;
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

    /**
     * 학습 정답 적립(API-11 study) — 정답(correct=KNOW)일 때만 source=CORRECT로 적립한다. 일일 한도(DAILY_CAP)를
     * 출석과 공유하며 넘기면 earned=0. 출석과 달리 streak·출석일은 건드리지 않는다. 레벨업 시 알림 이벤트(AFTER_COMMIT).
     * 정답이 아니면 적립 없이 현재 누적 exp를 담아 델타를 돌려준다(earned=0).
     */
    /**
     * 학습 정답 적립(API-11 study) — 정답(correct=KNOW)일 때만 source=CORRECT로 적립한다. 출석과 달리 streak은 안 건드린다.
     * 정답이 아니면 적립 없이 현재 누적 exp를 담아 델타를 돌려준다(earned=0).
     */
    @Transactional
    public ExpDelta awardStudy(Long userId, boolean correct) {
        return grant(userId, SOURCE_CORRECT, correct ? STUDY_EXP : 0);
    }

    /** 캡처 적립(API-6c) — 오답 카드 기록(분석 완료) 습관을 보상한다(source=CAPTURE, 소액). 일일 한도 공유. */
    @Transactional
    public ExpDelta awardCapture(Long userId) {
        return grant(userId, SOURCE_CAPTURE, CAPTURE_EXP);
    }

    /** 공통 적립 — 일일 한도(DAILY_CAP) 내에서 amount만큼(초과 시 0), exp_log 기록 + 레벨 재계산. 레벨업 시 알림 이벤트(AFTER_COMMIT). */
    private ExpDelta grant(Long userId, String source, int amount) {
        UserStat stat = userStatRepository.findById(userId).orElseGet(() -> UserStat.of(userId));
        int earned = 0;
        if (amount > 0) {
            LocalDate today = LocalDate.now();
            int todaySum = expLogRepository.sumEarnedOn(userId, today);
            earned = Math.max(0, Math.min(amount, DAILY_CAP - todaySum));
            if (earned > 0) {
                expLogRepository.save(ExpLog.of(userId, source, earned, today));
            }
        }
        boolean levelUp = stat.addExp(earned);
        userStatRepository.save(stat);
        if (levelUp) {
            eventPublisher.publishEvent(new ExpEvents.LeveledUp(userId, stat.getLevel()));
        }
        return new ExpDelta(earned, stat.getExp(), levelUp);
    }

    /**
     * 경험치 현황(API-19). 통계 행이 없으면 기본 상태(레벨 1)로 응답한다.
     * 오늘의 퀘스트=<b>복습 진행도</b>: 오늘 학습 수 / (오늘 학습 수 + 현재 복습 대기), 복습 대기 0이면 완료.
     */
    @Transactional(readOnly = true)
    public ExpSummary getSummary(Long userId) {
        UserStat stat = userStatRepository.findById(userId).orElseGet(() -> UserStat.of(userId));
        int todayEarned = expLogRepository.sumEarnedOn(userId, LocalDate.now());

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime dayStart = LocalDate.now().atStartOfDay();
        long completedToday = studyStatsService.studyCount(userId, dayStart, dayStart.plusDays(1));
        long reviewDue = cardStatsService.reviewDue(userId, now);
        long target = completedToday + reviewDue;
        Quest quest = new Quest("오늘의 복습", (int) completedToday, (int) target, target > 0 && reviewDue == 0);

        return new ExpSummary(stat.getLevel(), stat.getExp(), stat.nextLevelExp(),
                todayEarned, DAILY_CAP, stat.getStreakDays(), quest);
    }
}
