/**
 * auth — 회원·로그인·JWT 발급/재발급 (F-01, PBKDF2 — NFR-04).
 * shared에만 의존, core·analysis를 알지 않는다 (13 §2). 10 전환 시 auth 서비스로 승격.
 * 소유 테이블: app_user · refresh_token.
 */
package com.jjikboka.auth;
