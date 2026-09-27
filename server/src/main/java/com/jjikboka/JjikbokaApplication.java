package com.jjikboka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

/**
 * 찍어보카 백엔드 — 모듈러 모놀리스 부트스트랩 (13 §1).
 * com.jjikboka 루트에 두어 Spring Modulith의 애플리케이션 베이스 패키지가 되게 한다 —
 * 하위 패키지(auth·card·exam·… + 조립 루트 app)가 각각 application module로 인식된다.
 * 컴포넌트 스캔·JPA 리포지토리·엔티티 스캔이 모두 이 루트를 기준으로 잡히므로 basePackages 명시가 불필요하다.
 * 실행: ./gradlew bootRun  (로컬·프로덕션 모두 프로세스 1개)
 */
@SpringBootApplication
@EnableAsync        // analysis 전용 스레드풀 — 톰캣 워커 보호 (05 §5-2)
@EnableScheduling   // analyze_job watchdog·야간 배치 (13 §6)
public class JjikbokaApplication {
    public static void main(String[] args) {
        // 커넥션 풀이 생기기 전에 JVM 시간대를 KST로 고정한다 — 늦으면 LocalDate가 하루 밀려 저장된다(#473).
        // (app.config.TimeZoneConfig와 같은 값. 루트는 app 모듈 내부를 참조할 수 없어 여기서 직접 적용한다.)
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
        SpringApplication.run(JjikbokaApplication.class, args);
    }
}
