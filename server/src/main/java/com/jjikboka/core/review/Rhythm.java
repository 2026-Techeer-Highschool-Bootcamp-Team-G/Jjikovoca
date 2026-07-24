package com.jjikboka.core.review;

/**
 * 오늘의 학습 리듬 (API-17 basic, F-10 위젯). study_log 원장에서 오늘 하루치를 뽑은 값 —
 * todayStudyMinutes=오늘 학습 분(duration_ms 합/60000), avgSessionMinutes=세션당 평균 학습 분(소수 1자리).
 * 세션은 학습 로그를 30분 간격으로 묶은 것(핫패스 홈 화면). 오늘 학습이 없으면 둘 다 0.
 */
public record Rhythm(int todayStudyMinutes, double avgSessionMinutes) {
}
