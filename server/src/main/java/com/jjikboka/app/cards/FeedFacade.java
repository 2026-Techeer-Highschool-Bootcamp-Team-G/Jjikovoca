package com.jjikboka.app.cards;

import com.jjikboka.core.card.CardQueryService;
import com.jjikboka.core.card.CardSummary;
import com.jjikboka.core.review.ExamFeedService;
import com.jjikboka.core.review.ExamTag;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 카드 피드 조립 (API-7 F-29, app 파사드). 피드 본문(core.card)에 시험 태깅 필터·칩(core.review)을 합친다 —
 * 두 도메인이 다른 슬라이스라 app이 조립한다(13 §2). examId·untagged 필터는 상호 배타(examId 우선).
 */
@Service
public class FeedFacade {

    private final CardQueryService cardQueryService;
    private final ExamFeedService examFeedService;

    FeedFacade(CardQueryService cardQueryService, ExamFeedService examFeedService) {
        this.cardQueryService = cardQueryService;
        this.examFeedService = examFeedService;
    }

    public List<FeedCard> getFeed(Long userId, String subject, Long examId, boolean untagged, String q) {
        List<CardSummary> cards = cardQueryService.getFeed(userId, subject);

        if (q != null && !q.isBlank()) {
            String needle = q.strip().toLowerCase();
            cards = cards.stream().filter(card -> matches(card, needle)).toList();
        }

        if (examId != null) {
            Set<Long> tagged = examFeedService.cardIdsForExam(examId);
            cards = cards.stream().filter(card -> tagged.contains(card.id())).toList();
        } else if (untagged) {
            Set<Long> tagged = examFeedService.taggedCardIds(userId);
            cards = cards.stream().filter(card -> !tagged.contains(card.id())).toList();
        }

        Map<Long, List<ExamTag>> examsByCard = examFeedService.examsFor(cards.stream().map(CardSummary::id).toList());
        return cards.stream().map(card -> FeedCard.of(card, examsByCard.get(card.id()))).toList();
    }

    /** 검색어 부분일치(대소문자 무시) — 단어·문맥 뜻·개념·요약 중 하나라도 포함하면 매치. */
    private boolean matches(CardSummary card, String needle) {
        return contains(card.word(), needle) || contains(card.contextMeaning(), needle)
                || contains(card.concept(), needle) || contains(card.summary(), needle);
    }

    private boolean contains(String value, String needle) {
        return value != null && value.toLowerCase().contains(needle);
    }
}
