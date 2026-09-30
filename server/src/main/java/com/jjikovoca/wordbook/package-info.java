/**
 * wordbook — 내 단어장(카드 목록) API. 카드 피드·보관함·삭제·시험 태그·연상 이미지를 카드·시험·분석에서 모아 제공하는
 * 최상단 모듈이다. card와 exam이 서로 얽혀 card 안으로 넣을 수 없어 따로 두었고, 다른 모듈이 의존하지 않는다.
 * 허용 의존은 아래 allowedDependencies로 제한되며 Spring Modulith verify()가 빌드에서 강제한다(13 §2).
 */
@org.springframework.modulith.ApplicationModule(allowedDependencies = {"card :: service", "card :: dto", "exam :: service", "exam :: dto", "analysis :: service", "common"})
package com.jjikovoca.wordbook;
