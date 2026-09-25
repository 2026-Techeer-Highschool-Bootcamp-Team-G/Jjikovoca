/**
 * analysis의 외부 노출 API(named interface "service"). 조립 루트(app)가 클로즈·mnemonic 조립에 쓰는 서비스만 노출한다
 * (예: GeminiClient·AnalyzeService·AnalyzePollingService). entity·repository는 모듈 internal로 숨겨진다(13 §2).
 */
@org.springframework.modulith.NamedInterface("service")
package com.jjikboka.analysis.service;
