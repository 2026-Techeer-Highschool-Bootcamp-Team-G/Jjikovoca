package com.jjikboka.app.study;

import com.jjikboka.core.card.CardReviewService;
import com.jjikboka.core.card.CardReviewState;
import com.jjikboka.core.review.StudyLogService;
import com.jjikboka.core.review.StudyRecordCommand;
import com.jjikboka.shared.error.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * 학습 기록 조립 (API-11, app 파사드). 카드 전이(core.card)와 study_log 원장(core.review)을 한 트랜잭션으로 엮는다 —
 * 둘 중 하나라도 실패하면 함께 롤백돼 "전이됐는데 기록이 없거나" 그 반대가 생기지 않는다.
 *
 * <p>enum 허용값·RETRY+CONFUSED 조합은 여기서 검증해 400 INVALID_STUDY_RESULT로 막는다(스펙 errorName 정합).
 */
@Service
public class StudyService {

    private static final Set<String> ACTIVITIES = Set.of("RETRY", "FLASHCARD", "CLOZE", "MATH_REVIEW");
    private static final Set<String> RESULTS = Set.of("KNOW", "CONFUSED", "DONT_KNOW");
    private static final Set<String> REASON_TAGS = Set.of("CONCEPT", "MISTAKE", "MISREAD", "TIME");

    private final CardReviewService cardReviewService;
    private final StudyLogService studyLogService;

    StudyService(CardReviewService cardReviewService, StudyLogService studyLogService) {
        this.cardReviewService = cardReviewService;
        this.studyLogService = studyLogService;
    }

    @Transactional
    public CardReviewState record(Long userId, Long cardId, StudyRecordRequest request) {
        validate(request);
        CardReviewState state = cardReviewService.applyResult(userId, cardId, request.result());  // 404 · 403 + 전이
        studyLogService.record(new StudyRecordCommand(
                userId, cardId, request.activity(), request.result(), request.reasonTag(),
                request.durationMs(), request.detail() == null ? null : request.detail().toString()));
        return state;
    }

    /** 허용값 밖 enum, RETRY+CONFUSED 조합은 400 INVALID_STUDY_RESULT. */
    private void validate(StudyRecordRequest request) {
        boolean ok = ACTIVITIES.contains(request.activity())
                && RESULTS.contains(request.result())
                && (request.reasonTag() == null || REASON_TAGS.contains(request.reasonTag()))
                && !("RETRY".equals(request.activity()) && "CONFUSED".equals(request.result()));
        if (!ok) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_STUDY_RESULT", "허용되지 않는 학습 결과입니다.");
        }
    }
}
