/**
 * stats의 외부 노출 API(named interface "service"). 경험치·리포트·랭킹·캐시 무효화 서비스를 노출한다
 * (analysis→ExpService, notification→ReportCacheEvictor, app→리포트/경험치 조립). entity·repository는 internal(13 §2).
 */
@org.springframework.modulith.NamedInterface("service")
package com.jjikboka.stats.service;
