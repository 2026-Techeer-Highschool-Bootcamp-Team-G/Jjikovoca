package com.jjikboka.app.exam;

import com.jjikboka.core.card.CardQueryService;
import com.jjikboka.core.card.ExamReviewItem;
import com.jjikboka.core.review.ExamReviewService;
import com.jjikboka.core.review.ExamTagService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 시험 넛지·대비 복습 조립 (API-45·42, app 파사드). 시험(core.review)과 카드(core.card)를 엮는다 —
 * 넛지는 최근 카드를 골라 일괄 태깅하고, 시험복습은 태깅 카드 중 오늘 due를 모은다. 시험 소유는 각 core 서비스가 강제한다(13 §2).
 */
@Service
public class ExamReviewFacade {

    private static final int DEFAULT_SINCE_DAYS = 14;

    private final ExamReviewService examReviewService;
    private final ExamTagService examTagService;
    private final CardQueryService cardQueryService;

    ExamReviewFacade(ExamReviewService examReviewService,
                     ExamTagService examTagService,
                     CardQueryService cardQueryService) {
        this.examReviewService = examReviewService;
        this.examTagService = examTagService;
        this.cardQueryService = cardQueryService;
    }

    @Transactional
    public TagRecentResponse tagRecent(Long userId, Long examId, TagRecentRequest request) {
        String subject = examReviewService.verifyAndGetSubject(userId, examId);   // 404 EXAM_NOT_FOUND · 403 + 과목
        int sinceDays = request.sinceDays() == null ? DEFAULT_SINCE_DAYS : request.sinceDays();
        List<Long> cardIds = cardQueryService.recentCardIds(userId, subject, LocalDateTime.now().minusDays(sinceDays));
        examTagService.tagRecent(userId, examId, cardIds);   // 소유검증 내장(IDOR 방어) + 멱등 태깅
        return new TagRecentResponse(examId, cardIds.size());
    }

    @Transactional(readOnly = true)
    public ExamReviewResponse today(Long userId, Long examId, int limit) {
        List<Long> cardIds = examReviewService.verifyAndGetTaggedCardIds(userId, examId);   // 404 · 403 + 태깅 id
        List<ExamReviewItem> cards = cardQueryService.getExamReviewCards(userId, cardIds, limit);
        return ExamReviewResponse.of(examId, cards);
    }
}
