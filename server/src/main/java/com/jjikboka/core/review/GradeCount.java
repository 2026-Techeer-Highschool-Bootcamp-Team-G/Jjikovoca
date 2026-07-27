package com.jjikboka.core.review;

/**
 * 카드별 등급 카운트 (단어장 분류·칩, API-7, core.review 공개 DTO). study_log의 판정 결과를 카드 단위로 센 값 —
 * know=알아요(KNOW)·dontKnow=몰라요(DONT_KNOW)·confused=헷갈려요(CONFUSED). 학습 이력이 없는 카드는 모두 0.
 *
 * <p>제품 분류 기준: <b>졸업완료=know≥4</b>, <b>약점유형=dontKnow+confused&gt;know</b>. 라이트너 박스/FSRS 졸업 플래그와는
 * 별개의 "누적 횟수" 기준이다(FE 칩 필터·카운트가 이 기준으로 일관 계산).
 */
public record GradeCount(int know, int dontKnow, int confused) {

    static final GradeCount ZERO = new GradeCount(0, 0, 0);

    /** 졸업완료 — 알아요 누적 4회 이상. */
    public boolean graduated() {
        return know >= 4;
    }

    /** 약점유형 — 몰라요+헷갈려요가 알아요보다 많음(0/0/0은 약점 아님). */
    public boolean weak() {
        return dontKnow + confused > know;
    }
}
