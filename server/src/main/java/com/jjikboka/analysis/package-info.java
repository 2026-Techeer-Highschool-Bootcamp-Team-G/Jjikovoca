/**
 * analysis — AI 분석 — 워커가 카드 생성·한도 차감/환불·경험치 반영.
 * 허용 의존은 아래 allowedDependencies로 제한되며 Spring Modulith verify()가 빌드에서 강제한다(13 §2). 순환 없음.
 */
@org.springframework.modulith.ApplicationModule(allowedDependencies = {"card", "quota", "stats", "common"})
package com.jjikboka.analysis;
