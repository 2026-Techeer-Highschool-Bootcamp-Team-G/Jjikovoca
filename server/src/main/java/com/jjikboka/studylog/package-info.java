/**
 * studylog — 학습 로그 원장 + 학습 통계 집계.
 * 허용 의존은 아래 allowedDependencies로 제한되며 Spring Modulith verify()가 빌드에서 강제한다(13 §2). 순환 없음.
 */
@org.springframework.modulith.ApplicationModule(allowedDependencies = {"common"})
package com.jjikboka.studylog;
