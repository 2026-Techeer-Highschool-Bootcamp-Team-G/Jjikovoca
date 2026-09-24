package com.jjikboka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

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
        SpringApplication.run(JjikbokaApplication.class, args);
    }
}
