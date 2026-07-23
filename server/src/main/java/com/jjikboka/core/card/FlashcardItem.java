package com.jjikboka.core.card;

/**
 * 플래시카드 큐 항목 (Notion API-ID 12, core.card 공개 DTO). 미졸업 WORD 카드의 학습용 요약 —
 * 단어·문맥 뜻·예문·박스. 정답 판정과 무관한 학습 표시용이라 정답 필드는 없다(13 §7).
 */
public record FlashcardItem(
        Long id,
        String word,
        String contextMeaning,
        String example,
        int boxLevel
) {

    static FlashcardItem from(Card card) {
        return new FlashcardItem(card.getId(), card.getWord(), card.getContextMeaning(),
                card.getExample(), card.getBoxLevel());
    }
}
