package com.jjikboka.shared.error;

/**
 * 공통 에러 응답 규약 (04 §0 · §2-4).
 * 성공은 각 컨트롤러의 응답 DTO, 실패는 이 형태로 통일한다.
 * errorName = 대문자 스네이크 상수, errorCode = HTTP 상태코드 문자열.
 */
public record ApiError(boolean success, String errorName, String errorCode, String message) {

    public static ApiError of(String errorName, String errorCode, String message) {
        return new ApiError(false, errorName, errorCode, message);
    }

    // 자주 쓰는 것 (04 §2-5)
    public static ApiError unauthorized()  { return of("UNAUTHORIZED", "401", "로그인이 필요합니다."); }
    public static ApiError forbidden()     { return of("FORBIDDEN", "403", "접근 권한이 없습니다."); }
    public static ApiError quotaExceeded() { return of("QUOTA_EXCEEDED", "429", "오늘의 AI 분석 횟수를 모두 사용했습니다."); }
    public static ApiError aiFailed()      { return of("AI_FAILED", "502", "AI 분석에 실패했습니다. 잠시 후 다시 시도해 주세요."); }
}
