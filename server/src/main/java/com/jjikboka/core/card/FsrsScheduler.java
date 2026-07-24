package com.jjikboka.core.card;

/**
 * FSRS 스케줄러 (F-19, core.card 순수 계산). open-spaced-repetition FSRS-6 장기(long-term) 공식만 구현한다 —
 * 하루 미만 학습단계(learning/relearning steps)는 이 앱이 일 단위 복습이라 생략하고, 매 복습을 장기 전이로 본다.
 *
 * <p>핵심 식(기본 파라미터 {@link #W}):
 * <ul>
 *   <li>망각곡선 R(t,S) = (1 + FACTOR·t/S)^DECAY — t=S일 때 R=0.9(안정도 S = 유지율 90% 간격)</li>
 *   <li>초기 안정도 S0(g)=w[g-1], 초기 난이도 D0(g)=w4−e^(w5·(g−1))+1</li>
 *   <li>성공 시 안정도 성장, 실패(Again) 시 안정도 감소, 난이도는 평균회귀</li>
 *   <li>다음 간격 I = (S/FACTOR)·(retention^(1/DECAY) − 1)</li>
 * </ul>
 * 개인화 가중치(user_stat.fsrs_params)는 후속 — 지금은 기본값 고정. 등급 g: 1=Again,2=Hard,3=Good,4=Easy.
 */
final class FsrsScheduler {

    /** FSRS-6 기본 파라미터(21개). w[20]=망각곡선 decay. */
    private static final double[] W = {
            0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001,
            1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014,
            1.8729, 0.5425, 0.0912, 0.0658, 0.1542
    };

    private static final double DECAY = -W[20];
    private static final double FACTOR = Math.pow(0.9, 1.0 / DECAY) - 1.0;
    private static final double DESIRED_RETENTION = 0.9;

    private static final double STABILITY_MIN = 0.001;
    private static final double DIFFICULTY_MIN = 1.0;
    private static final double DIFFICULTY_MAX = 10.0;
    private static final double MAX_INTERVAL_DAYS = 36500.0;

    private FsrsScheduler() {
    }

    /** 첫 복습(NEW) — 등급으로 초기 안정도/난이도를 잡는다. */
    static FsrsState initial(int grade) {
        double stability = Math.max(STABILITY_MIN, W[grade - 1]);
        double difficulty = clampDifficulty(initialDifficulty(grade));
        return new FsrsState(stability, difficulty);
    }

    /**
     * 다음 복습 상태 — 직전 복습으로부터 경과일(elapsedDays)로 현재 R을 구해 안정도/난이도를 갱신한다.
     * grade=Again(1)이면 실패 경로(안정도 감소), 그 외는 성공 경로(안정도 성장).
     */
    static FsrsState next(double stability, double difficulty, long elapsedDays, int grade) {
        double r = retrievability(stability, elapsedDays);
        double newDifficulty = clampDifficulty(nextDifficulty(difficulty, grade));
        double newStability = grade == 1
                ? forgetStability(difficulty, stability, r)
                : recallStability(difficulty, stability, r, grade);
        return new FsrsState(Math.max(STABILITY_MIN, newStability), newDifficulty);
    }

    /** 현재 안정도에서 경과일 t의 회상확률 R(t). 안정도 없으면 0. */
    static double retrievability(double stability, long elapsedDays) {
        if (stability <= 0) {
            return 0.0;
        }
        double t = Math.max(0, elapsedDays);
        return Math.pow(1.0 + FACTOR * t / stability, DECAY);
    }

    /** 목표 유지율(0.9)에서의 다음 복습 간격(일). 최소 1일, 상한 clamp. */
    static long intervalDays(double stability) {
        double interval = (stability / FACTOR) * (Math.pow(DESIRED_RETENTION, 1.0 / DECAY) - 1.0);
        return (long) Math.min(MAX_INTERVAL_DAYS, Math.max(1.0, Math.round(interval)));
    }

    private static double initialDifficulty(int grade) {
        return W[4] - Math.exp(W[5] * (grade - 1)) + 1.0;
    }

    /** 난이도 갱신 — 선형 변화 후 초기 Easy 난이도로 평균회귀(w7). */
    private static double nextDifficulty(double difficulty, int grade) {
        double delta = -W[6] * (grade - 3);
        double damped = difficulty + delta * (10.0 - difficulty) / 9.0;
        double reverted = W[7] * clampDifficulty(initialDifficulty(4)) + (1.0 - W[7]) * damped;
        return reverted;
    }

    /** 성공(g≠1) 안정도 성장 — Hard 페널티(w15)·Easy 보너스(w16) 포함. */
    private static double recallStability(double difficulty, double stability, double r, int grade) {
        double hardPenalty = grade == 2 ? W[15] : 1.0;
        double easyBonus = grade == 4 ? W[16] : 1.0;
        double growth = Math.exp(W[8]) * (11.0 - difficulty) * Math.pow(stability, -W[9])
                * (Math.exp((1.0 - r) * W[10]) - 1.0) * hardPenalty * easyBonus;
        return stability * (1.0 + growth);
    }

    /** 실패(Again) 안정도 — 감소하되 직전 안정도를 넘지 않게 한다. */
    private static double forgetStability(double difficulty, double stability, double r) {
        double forget = W[11] * Math.pow(difficulty, -W[12])
                * (Math.pow(stability + 1.0, W[13]) - 1.0) * Math.exp((1.0 - r) * W[14]);
        return Math.min(forget, stability);
    }

    private static double clampDifficulty(double difficulty) {
        return Math.min(DIFFICULTY_MAX, Math.max(DIFFICULTY_MIN, difficulty));
    }

    /** FSRS 상태값(안정도·난이도). 간격·R은 이 값에서 파생한다. */
    record FsrsState(double stability, double difficulty) {
    }
}
