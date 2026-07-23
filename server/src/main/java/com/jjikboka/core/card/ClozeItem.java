package com.jjikboka.core.card;

import java.util.List;

/**
 * 빈칸 퀴즈 문항 (Notion API-ID 14, core.card 공개 DTO). 빈칸 처리된 예문·뜻·힌트만 담고
 * <b>정답 단어는 담지 않는다</b>(치팅 방지 — 판정은 서버, 13 §7). hints는 빈칸 토큰 기준.
 */
public record ClozeItem(
        Long cardId,
        String clozeText,
        String meaning,
        List<String> hints
) {

    static ClozeItem from(Card card) {
        ClozeMaker.Cloze cloze = ClozeMaker.make(card.getWord(), card.getExample(), card.getContextMeaning());
        return new ClozeItem(card.getId(), cloze.clozeText(), card.getContextMeaning(), cloze.hints());
    }
}
