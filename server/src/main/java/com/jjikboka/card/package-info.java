/**
 * card — 카드 애그리거트 — 캡처·분석저장·피드·보관함·Leitner 복습·클로즈·태깅·mnemonic.
 * 허용 의존은 아래 allowedDependencies로 제한되며 Spring Modulith verify()가 빌드에서 강제한다(13 §2). 순환 없음.
 */
@org.springframework.modulith.ApplicationModule(allowedDependencies = {"quota :: service", "studylog", "subscription :: service", "common"})
package com.jjikboka.card;
