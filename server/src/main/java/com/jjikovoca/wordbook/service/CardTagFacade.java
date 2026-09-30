package com.jjikovoca.wordbook.service;

import com.jjikovoca.card.service.CardQueryService;
import com.jjikovoca.exam.dto.ExamTag;
import com.jjikovoca.exam.service.ExamTagService;
import com.jjikovoca.wordbook.dto.CardTagResponse;
import com.jjikovoca.wordbook.dto.CardUntagResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 카드 시험 태깅 조립 (API-43·44, wordbook 파사드). 카드 소유(core.card)와 시험 소유(core.review)를 각 슬라이스에 맡기고
 * exam_card 태깅을 한 트랜잭션으로 엮는다 — 카드·시험 엔티티가 서로 다른 슬라이스라 wordbook이 양쪽을 검증·조립한다(13 §2).
 */
@Service
public class CardTagFacade {

    private final CardQueryService cardQueryService;
    private final ExamTagService examTagService;

    CardTagFacade(CardQueryService cardQueryService, ExamTagService examTagService) {
        this.cardQueryService = cardQueryService;
        this.examTagService = examTagService;
    }

    @Transactional
    public CardTagResponse tag(Long userId, Long cardId, List<Long> examIds) {
        cardQueryService.requireOwned(userId, cardId);   // 404 · 403 (카드 쪽)
        List<Long> targets = examIds == null ? List.of() : examIds;
        List<ExamTag> exams = examTagService.tag(userId, cardId, targets);   // 시험 소유검증 + 멱등 태깅
        return new CardTagResponse(cardId, exams);
    }

    @Transactional
    public CardUntagResponse untag(Long userId, Long cardId, Long examId) {
        cardQueryService.requireOwned(userId, cardId);   // 404 · 403 (카드 쪽)
        examTagService.untag(userId, cardId, examId);   // 시험 소유검증 + 멱등 삭제
        return new CardUntagResponse(cardId, examId);
    }
}
