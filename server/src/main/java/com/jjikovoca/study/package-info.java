/**
 * study — 학습 세션 API. 복습 큐·플래시카드 큐·학습 기록·클로즈 문제 풀이·추천을 카드·통계·학습기록에서 모아 제공하는
 * 최상단 모듈이라 다른 모듈이 의존하지 않는다.
 * 허용 의존은 아래 allowedDependencies로 제한되며 Spring Modulith verify()가 빌드에서 강제한다(13 §2).
 */
@org.springframework.modulith.ApplicationModule(allowedDependencies = {"card :: service", "card :: dto", "stats :: service", "stats :: dto", "studylog :: service", "studylog :: dto", "analysis :: service", "common"})
package com.jjikovoca.study;
