package com.jjikboka.core.card;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 플래시카드 큐 항목 (Notion API-ID 12, core.card 공개 DTO). 미졸업 WORD 카드의 학습용 요약 —
 * 단어·문맥 뜻·예문·박스 + 발음·품사·유형태그·이모지(Phase 5). 정답 판정과 무관한 학습 표시용이라 정답 필드는 없다(13 §7).
 * recallProb는 now 시점 FSRS 회상확률(R) — FSRS 카드만 채워지고 Lightner·미복습 카드는 null이다("N일 뒤 잊을 확률" 표시용).
 */
public record FlashcardItem(
        Long id,
        String word,
        String contextMeaning,
        String example,
        int boxLevel,
        Double recallProb,
        String pronunciation,
        String pos,
        List<String> tags,
        String emoji
) {

    static FlashcardItem from(Card card, LocalDateTime now) {
        return new FlashcardItem(card.getId(), card.getWord(), card.getContextMeaning(),
                card.getExample(), card.getBoxLevel(), card.currentRetrievability(now),
                card.getPronunciation(), card.getPos(), card.getTags(), card.getEmoji());
    }
}
