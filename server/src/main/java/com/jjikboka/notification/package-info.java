/**
 * notification — 알림(카드/통계 상태 참조).
 * 허용 의존은 아래 allowedDependencies로 제한되며 Spring Modulith verify()가 빌드에서 강제한다(13 §2). 순환 없음.
 */
@org.springframework.modulith.ApplicationModule(allowedDependencies = {"card", "stats", "common"})
package com.jjikboka.notification;
