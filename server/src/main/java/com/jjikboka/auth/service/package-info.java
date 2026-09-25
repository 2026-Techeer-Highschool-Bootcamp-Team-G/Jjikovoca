/**
 * auth의 외부 노출 API(named interface "service"). 다른 모듈은 UserQueryService(회원 조회)와
 * 보안 인프라(JwtProvider·JwtAuthenticationFilter, 조립 루트가 SecurityConfig에 연결)를 이 패키지로만 참조한다.
 * entity·repository는 모듈 internal로 숨겨진다(Modulith 경계, 13 §2).
 */
@org.springframework.modulith.NamedInterface("service")
package com.jjikboka.auth.service;
