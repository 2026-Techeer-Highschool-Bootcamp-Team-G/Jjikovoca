package com.jjikboka.support;

import java.util.TimeZone;

/**
 * Testcontainers 테스트의 시간대를 프로덕션 구성과 똑같이 맞춘다.
 *
 * <p>프로덕션은 JVM(TimeZoneConfig)과 JDBC 연결(connectionTimeZone=Asia/Seoul, 세션 강제)이 모두 KST라
 * DB 기본값(created_at)·LocalDate(quota_date)·LocalDateTime.now()가 같은 시계를 본다. 테스트가 JVM만 UTC로 고정하고
 * JDBC URL에 시간대를 주지 않으면, 드라이버가 풀 생성 시점의 JVM 시간대(KST)를 연결 시간대로 잡아
 * Hibernate가 DATETIME을 읽을 때 9시간을 밀어 버린다(JdbcTemplate은 원시값이라 멀쩡해 원인이 가려진다).
 * 그러면 created_at 기반 로직(빈칸 콤보의 세션 간격, 잔디·리듬 집계)이 테스트에서만 틀린다.
 * 둘 다 KST로 두면 날짜 경계 플래키(#454)의 원인이던 JVM↔DB 시간대 불일치 자체가 사라진다.
 */
public final class TestTimeZone {

    public static final String ZONE = "Asia/Seoul";

    private TestTimeZone() {
    }

    /** 컨테이너 JDBC URL에 프로덕션과 같은 연결 시간대 파라미터를 붙인다. */
    public static String jdbcUrl(String containerJdbcUrl) {
        String separator = containerJdbcUrl.contains("?") ? "&" : "?";
        return containerJdbcUrl + separator + "connectionTimeZone=" + ZONE + "&forceConnectionTimeZoneToSession=true";
    }

    /** JVM 기본 시간대를 프로덕션(TimeZoneConfig)과 같게 고정한다. 컨텍스트 기동 후에도 매 테스트 직전 호출한다. */
    public static void pinJvm() {
        TimeZone.setDefault(TimeZone.getTimeZone(ZONE));
    }
}
