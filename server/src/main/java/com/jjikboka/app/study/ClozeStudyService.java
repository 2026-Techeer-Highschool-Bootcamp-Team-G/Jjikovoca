package com.jjikboka.app.study;

import com.jjikboka.core.card.ClozeAnswerResult;
import com.jjikboka.core.card.ClozeService;
import com.jjikboka.core.review.StudyLogService;
import com.jjikboka.core.review.StudyRecordCommand;
import com.jjikboka.shared.error.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 빈칸 답 제출 조립 (API-15, app 파사드). 판정·전이(core.card)와 study_log 원장(core.review)을 한 트랜잭션으로 엮는다.
 * guess 누락은 여기서 400 MISSING_GUESS로 막고, 판정 결과를 그대로 CLOZE 활동으로 기록한다(정답=KNOW·오답=DONT_KNOW).
 */
@Service
public class ClozeStudyService {

    private final ClozeService clozeService;
    private final StudyLogService studyLogService;

    ClozeStudyService(ClozeService clozeService, StudyLogService studyLogService) {
        this.clozeService = clozeService;
        this.studyLogService = studyLogService;
    }

    @Transactional
    public ClozeAnswerResponse submit(Long userId, Long cardId, ClozeAnswerRequest request) {
        if (request.guess() == null || request.guess().isBlank()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "MISSING_GUESS", "답을 입력해 주세요.");
        }
        ClozeAnswerResult result = clozeService.submit(userId, cardId, request.guess());   // 404 · 403 + 판정 + 전이
        studyLogService.record(new StudyRecordCommand(
                userId, cardId, "CLOZE", result.correct() ? "KNOW" : "DONT_KNOW",
                null, request.durationMs(), null));
        return ClozeAnswerResponse.from(result);
    }
}
