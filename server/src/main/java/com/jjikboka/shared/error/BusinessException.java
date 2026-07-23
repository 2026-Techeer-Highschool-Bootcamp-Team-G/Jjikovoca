package com.jjikboka.shared.error;

import org.springframework.http.HttpStatus;

/**
 * 도메인 공통 비즈니스 예외. 서비스 계층이 상황에 맞는 errorName·상태코드로 던지면
 * {@link GlobalExceptionHandler}가 04/Notion 규약의 {@link ApiError}로 변환한다.
 *
 * 예) 중복 이메일 → {@code new BusinessException(HttpStatus.CONFLICT, "DUPLICATE_EMAIL", "이미 가입된 이메일입니다.")}
 */
public class BusinessException extends RuntimeException {

    private final HttpStatus status;
    private final String errorName;

    public BusinessException(HttpStatus status, String errorName, String message) {
        super(message);
        this.status = status;
        this.errorName = errorName;
    }

    public HttpStatus status() {
        return status;
    }

    public String errorName() {
        return errorName;
    }
}
