package com.jjikboka.core.card;

/**
 * 카드 상세 (Notion API-ID 8, core.card 공개 DTO). WORD는 뜻·예문, PROBLEM은 요약·힌트가 채워지고
 * 반대 타입 필드는 null이다. <b>정답·풀이는 싣지 않는다</b>(13 §7).
 *
 * <p><b>힌트 게이팅</b>: hint1은 항상 열고, hint2·hint3는 프리미엄에게만 준다. 무료 사용자에겐 null로 가리고
 * {@code hintsLocked=true}로 잠금을 알린다 — 단계별 힌트일 뿐 정답은 주지 않는다는 원칙(API-6 §힌트).
 */
public record CardDetail(
        Long id,
        String type,
        String subject,
        String imagePath,
        int boxLevel,
        boolean graduated,
        // WORD
        String word,
        String contextMeaning,
        String dictMeaning,
        String example,
        // PROBLEM
        String summary,
        String latex,
        String concept,
        String hint1,
        String hint2,
        String hint3,
        boolean hintsLocked
) {

    static CardDetail from(Card card, boolean premium) {
        boolean isProblem = "PROBLEM".equals(card.getType());
        boolean locked = isProblem && !premium;
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
                card.getSummary(),
                card.getLatex(),
                card.getConcept(),
                card.getHint1(),
                premium ? card.getHint2() : null,
                premium ? card.getHint3() : null,
                locked);
    }
}
