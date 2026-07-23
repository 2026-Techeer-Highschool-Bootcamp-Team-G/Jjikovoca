package com.jjikboka.core.review;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 학습 기록 (core.review 공개 진입점, API-11). 커맨드를 받아 study_log에 한 줄 남긴다 — INSERT-only 원장이라 수정하지 않는다.
 * 트랜잭션은 호출자(app)가 소유해 카드 전이와 원자적으로 커밋된다(둘 중 하나라도 실패하면 함께 롤백).
 */
@Service
public class StudyLogService {

    private final StudyLogRepository studyLogRepository;

    StudyLogService(StudyLogRepository studyLogRepository) {
        this.studyLogRepository = studyLogRepository;
    }

    @Transactional
    public void record(StudyRecordCommand command) {
        studyLogRepository.save(StudyLog.of(command));
    }
}
