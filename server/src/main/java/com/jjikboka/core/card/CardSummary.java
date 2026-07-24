package com.jjikboka.core.card;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 카드 피드 항목 (Notion API-ID 7, core.card 공개 DTO). 피드에 필요한 요약 필드만 담는다 —
 * <b>정답·풀이는 싣지 않는다</b>(13 §7). WORD는 word·contextMeaning + 유형태그·이모지(Phase 5, 피드 칩),
 * PROBLEM은 concept·summary가 채워지고 반대 타입 필드는 null이다. graduated는 graduated_at 존재로 계산된 값.
 */
public record CardSummary(
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
        String emoji
) {

    static CardSummary from(Card card) {
        return new CardSummary(
                card.getId(),
                card.getType(),
                card.getSubject(),
                card.getWord(),
                card.getContextMeaning(),
                card.getConcept(),
                card.getSummary(),
                card.getBoxLevel(),
                card.isGraduated(),
                card.getCreatedAt(),
                card.getPronunciation(),
                card.getPos(),
                card.getTags(),
                card.getEmoji());
    }
}
