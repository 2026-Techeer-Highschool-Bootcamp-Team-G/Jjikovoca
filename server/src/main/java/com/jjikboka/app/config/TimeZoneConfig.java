package com.jjikboka.app.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.util.TimeZone;

/**
 * 앱 기본 시간대 고정 (KST, #217). created_at 등 DB 기본값(JDBC connectionTimeZone=Asia/Seoul로 세션 TZ=KST)과
 * {@code LocalDate.now()}/{@code LocalDateTime.now()}의 "오늘" 경계를 일치시킨다 — 둘의 TZ가 다르면
 * 좁은 날짜 창 집계(리포트 rhythm·grass·월 경계)가 어긋난다. 컨테이너/호스트 TZ에 의존하지 않도록 부팅 시 1회 못박는다.
 */
@Configuration
public class TimeZoneConfig {

    @PostConstruct
    void setDefaultTimeZone() {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
    }
}
