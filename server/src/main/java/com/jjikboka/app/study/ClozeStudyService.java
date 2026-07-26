package com.jjikboka.app.study;

import com.jjikboka.core.card.ClozeAnswerResult;
import com.jjikboka.core.card.ClozeService;
import com.jjikboka.core.review.StudyLogService;
import com.jjikboka.core.review.StudyRecordCommand;
import com.jjikboka.core.review.StudyStatsService;
import com.jjikboka.core.stats.ClozeExp;
import com.jjikboka.core.stats.ExpService;
import com.jjikboka.shared.error.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 빈칸 답 제출 조립 (API-15, app 파사드). 판정·전이(core.card) + study_log 원장(core.review) + 경험치(core.stats)를
 * 한 트랜잭션으로 엮는다 — 이 엔드포인트가 CLOZE 학습의 <b>단일 기록·시간·경험치 주체</b>다(FE는 별도 /study 미호출).
 * guess 누락은 여기서 400 MISSING_GUESS로 막고, 판정 결과를 그대로 CLOZE 활동으로 기록한다(정답=KNOW·오답=DONT_KNOW).
 *
 * <p>콤보는 이번 정답을 <b>기록하기 직전</b>의 세션 연속 정답 수(prior)를 파생해, 정답이면 prior+1·오답이면 0으로 만든다.
 * combo≥2일 때만 보너스가 붙는다(첫 정답은 base만). 콤보 상태는 study_log 파생이라 DB 컬럼·FE 전송이 필요 없다.
 */
@Service
public class ClozeStudyService {

    private final ClozeService clozeService;
    private final StudyLogService studyLogService;
    private final StudyStatsService studyStatsService;
    private final ExpService expService;

    ClozeStudyService(ClozeService clozeService, StudyLogService studyLogService,
                      StudyStatsService studyStatsService, ExpService expService) {
        this.clozeService = clozeService;
        this.studyLogService = studyLogService;
        this.studyStatsService = studyStatsService;
        this.expService = expService;
    }

    @Transactional
    public ClozeAnswerResponse submit(Long userId, Long cardId, ClozeAnswerRequest request) {
        if (request.guess() == null || request.guess().isBlank()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "MISSING_GUESS", "답을 입력해 주세요.");
        }
        ClozeAnswerResult result = clozeService.submit(userId, cardId, request.guess());   // 404 · 403 + 판정 + 전이

        // 이번 정답을 기록하기 전 세션 연속 정답 수 → 정답이면 +1, 오답이면 0.
        LocalDateTime now = LocalDateTime.now();
        int priorCombo = studyStatsService.consecutiveClozeCorrect(userId, now);
        int combo = result.correct() ? priorCombo + 1 : 0;

        studyLogService.record(new StudyRecordCommand(
                userId, cardId, "CLOZE", result.correct() ? "KNOW" : "DONT_KNOW",
                null, request.durationMs(), null));

        ClozeExp exp = expService.awardCloze(userId, result.correct(), combo >= 2);
        return ClozeAnswerResponse.from(result, exp, combo);
    }
}
