package com.jjikboka.core.card;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 수학 정답 판정 (API-31, 서버 강제). answer_format으로 분기한다.
 *
 * <ul>
 *   <li><b>NUMERIC</b> — 숫자·쉼표. 순서 무관 집합 비교(공백 무시·소수 정규화). {@code "2,3" == "3, 2"}, {@code "2.0" == "2"}</li>
 *   <li><b>CHOICE</b>(및 기타) — 공백 제거·소문자 후 문자열 일치</li>
 * </ul>
 * 정답 원본(answerValue)은 이 판정과 판정 응답에서만 쓰이고, 큐·조회엔 노출되지 않는다(13 §7).
 */
final class MathJudge {

    private MathJudge() {
    }

    static boolean judge(String answerFormat, String answerValue, String guess) {
        if (answerValue == null || guess == null) {
            return false;
        }
        if ("NUMERIC".equals(answerFormat)) {
            return numericSet(guess).equals(numericSet(answerValue));
        }
        return normalize(guess).equals(normalize(answerValue));
    }

    /** 쉼표로 나눠 각 숫자를 정규화(후행 0 제거)한 집합. 파싱 실패 토큰은 원문 문자열로 담아 오답 처리되게 한다. */
    private static Set<String> numericSet(String value) {
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(token -> !token.isEmpty())
                .map(MathJudge::canonicalNumber)
                .collect(Collectors.toSet());
    }

    private static String canonicalNumber(String token) {
        try {
            return new BigDecimal(token).stripTrailingZeros().toPlainString();
        } catch (NumberFormatException e) {
            return token.toLowerCase();
        }
    }

    private static String normalize(String value) {
        return value.replaceAll("\\s+", "").toLowerCase();
    }
}
