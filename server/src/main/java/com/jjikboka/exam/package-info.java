/**
 * exam — 시험 등록·D-day·시험 태깅(복습 파사드가 card 조회).
 * 허용 의존은 아래 allowedDependencies로 제한되며 Spring Modulith verify()가 빌드에서 강제한다(13 §2). 순환 없음.
 */
@org.springframework.modulith.ApplicationModule(allowedDependencies = {"card", "common"})
package com.jjikboka.exam;
