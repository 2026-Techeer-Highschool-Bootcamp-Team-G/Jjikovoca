/**
 * card의 외부 노출 API(named interface "service"). 다른 모듈·조립 루트는 카드 조회/명령/복습/통계/클로즈/mnemonic
 * 서비스만 이 패키지로 참조한다. entity·repository는 모듈 internal로 숨겨진다(Modulith 경계, 13 §2).
 */
@org.springframework.modulith.NamedInterface("service")
package com.jjikboka.card.service;
