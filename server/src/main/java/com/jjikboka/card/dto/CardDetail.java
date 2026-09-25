package com.jjikboka.card.dto;

import com.jjikboka.card.entity.Card;

import java.util.List;

/**
 * 카드 상세 (Notion API-ID 8, core.card 공개 DTO). 영어 단어(WORD) 카드 — 뜻·예문·발음·품사·유형태그·이모지(Phase 5).
 * concept은 약한 개념 리포트용 분류(미채움 null).
 */
public record CardDetail(
        Long id,
        String type,
        String subject,
        String imagePath,
        int boxLevel,
        boolean graduated,
        String word,
        String contextMeaning,
        String dictMeaning,
        String example,
        String exampleMeaning,
        String pronunciation,
        String pos,
        List<String> tags,
        String emoji,
        String mnemonicImagePath,
        String concept
) {

    /** premium은 호환용 인자(과거 힌트 게이팅 잔재) — 현재 단어 카드는 게이팅이 없다. */
    public static CardDetail from(Card card, boolean premium) {
        return new CardDetail(
                card.getId(),
                card.getType(),
                card.getSubject(),
                card.getImagePath(),
                card.getBoxLevel(),
                card.isGraduated(),
                card.getWord(),
                card.getContextMeaning(),
                card.getDictMeaning(),
                card.getExample(),
                card.getExampleMeaning(),
                card.getPronunciation(),
                card.getPos(),
                card.getTags(),
                card.getEmoji(),
                card.getMnemonicImagePath(),
                card.getConcept());
    }
}
