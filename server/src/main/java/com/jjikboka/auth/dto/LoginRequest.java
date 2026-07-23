package com.jjikboka.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * 로그인 요청 (Notion API-ID 2). 검증은 형식만 — 자격 증명 일치 여부는 서비스가 판정하고,
 * 실패 시 이메일/비밀번호를 구분하지 않는 401 메시지로 응답한다(계정 존재 노출 방지).
 */
public record LoginRequest(

        @NotBlank @Email
        String email,

        @NotBlank
        String password
) {
}
