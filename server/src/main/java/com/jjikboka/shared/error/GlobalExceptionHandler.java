package com.jjikboka.shared.error;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 전역 예외 → 공통 에러 응답(04 §0 / Notion 규약: {@link ApiError} 4필드) 변환.
 * 성공은 {@code ApiResponse}, 실패는 여기로 모아 최상위 응답 형태를 프로젝트 전역에서 통일한다.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 도메인이 명시적으로 던진 비즈니스 예외 (예: 409 DUPLICATE_EMAIL). */
    @ExceptionHandler(BusinessException.class)
    ResponseEntity<ApiError> handleBusiness(BusinessException e) {
        return ResponseEntity.status(e.status())
                .body(ApiError.of(e.errorName(), String.valueOf(e.status().value()), e.getMessage()));
    }

    /** @Valid 검증 실패 → 400 VALIDATION_ERROR (필드별 사유는 노출하지 않고 공통 메시지로). */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException e) {
        return ResponseEntity.badRequest()
                .body(ApiError.of("VALIDATION_ERROR", "400", "요청 값이 올바르지 않습니다."));
    }
}
