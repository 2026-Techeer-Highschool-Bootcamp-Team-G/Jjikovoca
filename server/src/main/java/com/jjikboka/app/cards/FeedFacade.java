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

    /**
     * 피드 조립 + 페이지네이션(무한 스크롤). 검색·시험 필터를 먼저 적용한 뒤 그 결과를 페이지로 자른다 —
     * 필터가 전체 집합에 정확히 걸리도록(페이지 이후가 아니라) 인메모리 슬라이스로 처리한다(단어 수 규모상 충분).
     * total은 필터 적용 후 전체 개수, hasNext는 다음 페이지 유무. 시험 칩(exams)은 반환 페이지에 대해서만 조회한다.
     */
    public CardFeedResponse getFeed(Long userId, String subject, Long examId, boolean untagged, String q,
                                    int page, int size) {
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

        long total = cards.size();
        int pageSize = Math.max(1, size);
        int from = Math.max(0, page) * pageSize;
        int to = Math.min(from + pageSize, cards.size());
        List<CardSummary> pageCards = from >= cards.size() ? List.of() : cards.subList(from, to);
        boolean hasNext = to < cards.size();

        Map<Long, List<ExamTag>> examsByCard = examFeedService.examsFor(pageCards.stream().map(CardSummary::id).toList());
        List<FeedCard> feed = pageCards.stream().map(card -> FeedCard.of(card, examsByCard.get(card.id()))).toList();
        return new CardFeedResponse(feed, total, hasNext);
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
