package com.jjikboka.core.card;

import java.util.List;
import java.util.regex.Pattern;

/**
 * 빈칸 퀴즈 생성·판정 로직 (API-14·15). 저장 예문에서 정답 토큰을 빈칸 처리하고, 제출 답을 판정한다.
 * AI 없이(0원) 카드의 word·example만으로 동작한다.
 *
 * <p><b>빈칸 토큰</b>: 단일 단어면 그 단어, 숙어(예 {@code take charge of})면 가장 긴 토큰({@code charge})을
 * 빈칸으로 삼는다(명세의 "빈칸 토큰 기준"). 힌트·판정 모두 이 토큰을 기준으로 한다.
 * <p><b>판정</b>: 제출 답이 전체 단어 또는 빈칸 토큰과 (공백 제거·소문자) 일치하면 정답으로 인정한다(숙어 대응).
 */
final class ClozeMaker {

    private static final String BLANK = "_____";

    private ClozeMaker() {
    }

    /** 빈칸 문항 한 건: 빈칸 처리된 예문 + 빈칸 토큰 + 힌트. 정답 단어 자체는 담지 않는다(치팅 방지). */
    record Cloze(String clozeText, String blankToken, List<String> hints) {
    }

    static Cloze make(String word, String example, String meaning) {
        String blankToken = pickBlankToken(word);
        String clozeText = blankOut(example, blankToken);
        List<String> hints = List.of(
                blankToken.substring(0, 1),
                blankToken.length() + "글자",
                meaning == null ? "" : meaning);
        return new Cloze(clozeText, blankToken, hints);
    }

    /** 제출 답이 전체 단어 또는 빈칸 토큰과 일치하는지(공백 제거·소문자). */
    static boolean judge(String word, String guess) {
        if (guess == null) {
            return false;
        }
        String normalized = normalize(guess);
        return normalized.equals(normalize(word)) || normalized.equals(normalize(pickBlankToken(word)));
    }

    /** 숙어는 가장 긴 토큰을 빈칸으로(내용어일 확률이 높다). 단일 단어면 그대로. */
    private static String pickBlankToken(String word) {
        String[] tokens = word.trim().split("\\s+");
        String longest = tokens[0];
        for (String token : tokens) {
            if (token.length() > longest.length()) {
                longest = token;
            }
        }
        return longest;
    }

    /** 예문에서 토큰을 단어 경계 기준·대소문자 무시로 빈칸 치환. 못 찾으면 예문을 그대로 둔다. */
    private static String blankOut(String example, String token) {
        if (example == null) {
            return BLANK;
        }
        return Pattern.compile("(?i)\\b" + Pattern.quote(token) + "\\b").matcher(example).replaceFirst(BLANK);
    }

    private static String normalize(String value) {
        return value.trim().toLowerCase();
    }
}
