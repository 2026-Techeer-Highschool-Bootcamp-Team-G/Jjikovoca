package com.jjikboka.common.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.util.TimeZone;

/**
 * 앱 기본 시간대 고정 (KST, #217). created_at 등 DB 기본값(JDBC connectionTimeZone=Asia/Seoul로 세션 TZ=KST)과
 * {@code LocalDate.now()}/{@code LocalDateTime.now()}의 "오늘" 경계를 일치시킨다 — 둘의 TZ가 다르면
 * 좁은 날짜 창 집계(리포트 rhythm·grass·월 경계)가 어긋난다.
 *
 * <p><b>반드시 커넥션 풀보다 먼저 적용해야 한다(#473).</b> Connector/J는 커넥션을 만들 때 JVM 기본 시간대를 캐시하는데,
 * 컨테이너 OS가 UTC인 채로 풀이 먼저 생기면 Hibernate가 바인딩하는 LocalDate(quota_date 등)가 하루 앞당겨 저장된다.
 * 그래서 {@code JjikbokaApplication.main()}이 컨텍스트 기동 전에 같은 값을 직접 적용하고(Dockerfile은 -Duser.timezone),
 * 여기 {@code @PostConstruct}는 main을 거치지 않는 실행을 위한 안전망으로만 남긴다.
 */
@Configuration
public class TimeZoneConfig {

    @PostConstruct
    void setDefaultTimeZone() {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
    }
}
