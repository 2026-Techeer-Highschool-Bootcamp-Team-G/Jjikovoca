package com.jjikboka.core.review;

import com.jjikboka.shared.event.StudyEvents;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 학습 기록 (core.review 공개 진입점, API-11). 커맨드를 받아 study_log에 한 줄 남긴다 — INSERT-only 원장이라 수정하지 않는다.
 * 트랜잭션은 호출자(app)가 소유해 카드 전이와 원자적으로 커밋된다(둘 중 하나라도 실패하면 함께 롤백).
 *
 * <p>기록 후 {@link StudyEvents.StudyRecorded}를 발행한다 — 이 유저의 월간 리포트 캐시를 무효화하려는 신호다(13 §6·§9).
 * 소비자는 커밋 이후(AFTER_COMMIT) evict하므로, 롤백된 기록으로 캐시가 지워지는 일은 없다.
 */
@Service
public class StudyLogService {

    private final StudyLogRepository studyLogRepository;
    private final ApplicationEventPublisher eventPublisher;

    StudyLogService(StudyLogRepository studyLogRepository, ApplicationEventPublisher eventPublisher) {
        this.studyLogRepository = studyLogRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public void record(StudyRecordCommand command) {
        studyLogRepository.save(StudyLog.of(command));
        eventPublisher.publishEvent(new StudyEvents.StudyRecorded(command.userId()));
    }
}
