package com.jjikboka.core.card;

import java.util.List;

/**
 * 수학 정답 판정 결과 (Notion API-ID 31, core.card 공개 DTO). 판정 후이므로 <b>정답(answerValue)·해설(explanation)을 공개</b>한다 —
 * 입력 후 공개 원칙(13 §7). solutions는 각 풀이의 explanation만 담고 단계 목록은 싣지 않는다(단계는 공개 API-30 담당).
 */
public record MathJudgeResult(
        boolean correct,
        String answerValue,
        List<Solution> solutions,
        MathDiagnosis diagnosis
) {
}
