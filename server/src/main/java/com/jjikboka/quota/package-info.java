/**
 * quota — 일일 AI 분석 한도.
 * 허용 의존은 아래 allowedDependencies로 제한되며 Spring Modulith verify()가 빌드에서 강제한다(13 §2). 순환 없음.
 */
@org.springframework.modulith.ApplicationModule(allowedDependencies = {"subscription :: service", "common"})
package com.jjikboka.quota;
