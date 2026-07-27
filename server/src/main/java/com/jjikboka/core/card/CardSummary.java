package com.jjikboka.core.card;

import com.jjikboka.core.review.GradeCount;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 카드 피드 항목 (Notion API-ID 7, core.card 공개 DTO). 피드에 필요한 요약 필드만 담는다 —
 * <b>정답·풀이는 싣지 않는다</b>(13 §7). WORD는 word·contextMeaning·예문(example·exampleMeaning) + 유형태그·이모지
 * (Phase 5, 피드 칩), PROBLEM은 concept·summary가 채워지고 반대 타입 필드는 null이다. graduated는 graduated_at 존재로 계산된 값.
 *
 * <p>example·exampleMeaning은 홈 카드 앞면(예문+해석)용 — 판정 데이터가 아니라 표시용이라 공개해도 무방(게임 큐 FlashcardItem과 동일 소스).
 * exampleMeaning은 미채운 카드면 null(FE 해석 줄 숨김).
 *
 * <p>knowCount·dontKnowCount·confusedCount는 단어장 분류·칩용 등급 누적 횟수(study_log 집계, API-7). 학습 이력이 없으면 0.
 * FE가 졸업완료(know≥4)·약점유형(dontKnow+confused&gt;know)을 이 값으로 계산한다 — {@code graduated} 플래그(박스/FSRS)와는 별개 기준.
 */
public record CardSummary(
        Long id,
        String type,
        String subject,
        String word,
        String contextMeaning,
        String example,
        String exampleMeaning,
        String concept,
        String summary,
        int boxLevel,
        boolean graduated,
        LocalDateTime createdAt,
        String pronunciation,
        String pos,
        List<String> tags,
        String emoji,
        int knowCount,
        int dontKnowCount,
        int confusedCount
) {

    /** 등급 카운트 없이(0/0/0) — 카운트가 불필요한 경로(내보내기·직접선택·시험복습 등)용. */
    static CardSummary from(Card card) {
        return from(card, GradeCount.ZERO);
    }

    /** 등급 카운트를 함께 실어(단어장 피드) — grade가 null이면 0으로 처리한다. */
    static CardSummary from(Card card, GradeCount grade) {
        GradeCount g = grade == null ? GradeCount.ZERO : grade;
        return new CardSummary(
                card.getId(),
                card.getType(),
                card.getSubject(),
                card.getWord(),
                card.getContextMeaning(),
                card.getExample(),
                card.getExampleMeaning(),
                card.getConcept(),
                card.getSummary(),
                card.getBoxLevel(),
                card.isGraduated(),
                card.getCreatedAt(),
                card.getPronunciation(),
                card.getPos(),
                card.getTags(),
                card.getEmoji(),
                g.know(),
                g.dontKnow(),
                g.confused());
    }
}
