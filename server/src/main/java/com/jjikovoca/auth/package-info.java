/**
 * auth — 인증·계정 — 회원가입·로그인·토큰·회원탈퇴.
 * 허용 의존은 아래 allowedDependencies로 제한되며 Spring Modulith verify()가 빌드에서 강제한다(13 §2). 순환 없음.
 */
@org.springframework.modulith.ApplicationModule(allowedDependencies = {"common"})
package com.jjikovoca.auth;
