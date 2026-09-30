/**
 * me — 내 정보 조회(/me). 회원·구독·쿼터·경험치를 한 응답으로 모으는 조회 전용 모듈이라 다른 모듈이 의존하지 않는다.
 * 허용 의존은 아래 allowedDependencies로 제한되며 Spring Modulith verify()가 빌드에서 강제한다(13 §2).
 */
@org.springframework.modulith.ApplicationModule(allowedDependencies = {"auth :: service", "auth :: dto", "quota :: service", "quota :: dto", "stats :: service", "stats :: dto", "subscription :: service", "subscription :: dto", "common"})
package com.jjikboka.me;
