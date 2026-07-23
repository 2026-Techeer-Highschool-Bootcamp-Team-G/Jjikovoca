package com.jjikboka.shared.response;

/**
 * 공통 성공 응답 래퍼 (Notion API 명세 기준): <pre>{ "success": true, "data": {...}, "message": "..." }</pre>
 *
 * 실패 응답은 {@link com.jjikboka.shared.error.ApiError}로 통일한다
 * (success=false + errorName/errorCode/message). 성공/실패의 최상위 형태를 프로젝트 전역에서 하나로 맞춘다.
 */
public record ApiResponse<T>(boolean success, T data, String message) {

    public static <T> ApiResponse<T> ok(T data, String message) {
        return new ApiResponse<>(true, data, message);
    }

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null);
    }
}
