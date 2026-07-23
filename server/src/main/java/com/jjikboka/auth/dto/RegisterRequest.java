package com.jjikboka.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 회원가입 요청 (Notion API-ID 1). nickname은 선택.
 * 검증 실패는 GlobalExceptionHandler가 400 VALIDATION_ERROR로 변환한다.
 */
public record RegisterRequest(

        @NotBlank @Email
        String email,

        @NotBlank @Size(min = 6, message = "비밀번호는 6자 이상이어야 합니다.")
        String password,

        String nickname
) {
}
