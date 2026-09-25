/**
 * exam의 외부 노출 API(named interface "service"). 조립 루트(app)가 피드·태깅 조립에 쓰는 서비스만 노출한다 —
 * entity·repository는 모듈 internal로 숨겨진다(Modulith 경계, 13 §2).
 */
@org.springframework.modulith.NamedInterface("service")
package com.jjikboka.exam.service;
