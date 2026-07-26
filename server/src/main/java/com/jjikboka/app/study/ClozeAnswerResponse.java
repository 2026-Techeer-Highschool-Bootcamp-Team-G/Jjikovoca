package com.jjikboka.app.study;

import com.jjikboka.core.card.ClozeAnswerResult;
import com.jjikboka.core.stats.ClozeExp;

import java.time.LocalDateTime;

/**
 * 빈칸 답 제출 응답 (Notion API-ID 15). 판정·전이 상태에 더해 해설(meaning·exampleMeaning)·경험치(exp)·콤보(combo)를
 * 한 객체로 평탄화한다 — 화면의 정답/오답 카드(정답 단어·뜻·예문 속 쓰임·+XP 배지·콤보)를 한 응답으로 그리게 한다.
 * 정답 단어는 채점 후이므로 공개한다(13 §7). exampleMeaning은 미채운 카드면 null(FE 숨김).
 *
 * <p>exp는 화면의 두 배지를 그리도록 분해했다 — base(정답 기본 +10)·comboBonus(연속 정답 +5)·earned(실제 적립)·
 * total(누적)·levelUp. combo는 서버가 study_log에서 파생한 현재 세션 연속 정답 수(오답이면 0).
 */
public record ClozeAnswerResponse(
        boolean correct,
        String word,
        Long cardId,
        int boxLevel,
        LocalDateTime nextReviewAt,
        boolean graduated,
        String meaning,
        String exampleMeaning,
        Exp exp,
        int combo
) {

    /** 경험치 분해 — 화면의 +10(base)·+15(base+comboBonus) 두 배지를 그린다. */
    public record Exp(int base, int comboBonus, int earned, int total, boolean levelUp) {

        static Exp from(ClozeExp exp) {
            return new Exp(exp.base(), exp.comboBonus(), exp.earned(), exp.total(), exp.levelUp());
        }
    }

    static ClozeAnswerResponse from(ClozeAnswerResult result, ClozeExp exp, int combo) {
        return new ClozeAnswerResponse(
                result.correct(),
                result.word(),
                result.state().cardId(),
                result.state().boxLevel(),
                result.state().nextReviewAt(),
                result.state().graduated(),
                result.meaning(),
                result.exampleMeaning(),
                Exp.from(exp),
                combo);
    }
}
