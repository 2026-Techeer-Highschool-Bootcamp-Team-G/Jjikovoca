/**
 * subscription의 외부 노출 API(named interface "service"). 다른 모듈은 이 패키지의 PremiumService만 참조한다 —
 * entity·repository·controller는 모듈 internal로 숨겨진다(Modulith 경계, 13 §2).
 */
@org.springframework.modulith.NamedInterface("service")
package com.jjikboka.subscription.service;
