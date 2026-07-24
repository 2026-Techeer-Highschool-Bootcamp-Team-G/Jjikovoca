package com.jjikboka.app.cards;

import com.jjikboka.core.card.CardSummary;
import com.jjikboka.core.review.ExamTag;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 피드 카드 (Notion API-ID 7, F-29). 카드 요약(core.card)에 시험 칩(core.review)을 붙인 조립 결과 —
 * 두 슬라이스가 다른 도메인이라 app에서 합친다(13 §2). 정답·풀이는 포함하지 않는다(13 §7).
 */
public record FeedCard(
        Long id,
        String type,
        String subject,
        String word,
        String contextMeaning,
        String concept,
        String summary,
        int boxLevel,
        boolean graduated,
        LocalDateTime createdAt,
        String pronunciation,
        String pos,
        List<String> tags,
        String emoji,
        List<ExamTag> exams
) {

    static FeedCard of(CardSummary card, List<ExamTag> exams) {
        return new FeedCard(card.id(), card.type(), card.subject(), card.word(), card.contextMeaning(),
                card.concept(), card.summary(), card.boxLevel(), card.graduated(), card.createdAt(),
                card.pronunciation(), card.pos(), card.tags(), card.emoji(),
                exams == null ? List.of() : exams);
    }
}
