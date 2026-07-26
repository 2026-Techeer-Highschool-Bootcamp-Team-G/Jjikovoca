package com.jjikboka.core.card;

import java.util.List;

/**
 * 빈칸 퀴즈 문항 (Notion API-ID 14, core.card 공개 DTO). 빈칸 처리된 예문·뜻·예문 한글번역·힌트만 담고
 * <b>정답 단어는 담지 않는다</b>(치팅 방지 — 판정은 서버, 13 §7). hints는 빈칸 토큰 기준.
 *
 * <p>exampleMeaning은 예문 전체의 한글번역(화면의 "한글 뜻" 줄) — 미채운 카드면 null(FE 숨김). 한↔영 단어
 * 정렬이 불안정해 한글 안 빈칸 위치는 FE가 렌더링한다.
 */
public record ClozeItem(
        Long cardId,
        String clozeText,
        String meaning,
        String exampleMeaning,
        List<String> hints
) {

    static ClozeItem from(Card card) {
        ClozeMaker.Cloze cloze = ClozeMaker.make(card.getWord(), card.getExample(), card.getContextMeaning());
        return new ClozeItem(card.getId(), cloze.clozeText(), card.getContextMeaning(),
                card.getExampleMeaning(), cloze.hints());
    }
}
