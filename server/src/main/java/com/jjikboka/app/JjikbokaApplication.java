package com.jjikboka.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 찍어보카 백엔드 — 모듈러 모놀리스 부트스트랩 (13 §1).
 * app 모듈이 auth·core·analysis·shared를 조립해 단일 이미지로 실행된다.
 * 실행: ./gradlew :app:bootRun  (로컬·프로덕션 모두 프로세스 1개)
 */
@SpringBootApplication(scanBasePackages = "com.jjikboka")
@EnableJpaRepositories(basePackages = "com.jjikboka")
@EntityScan(basePackages = "com.jjikboka")
@EnableAsync        // analysis 전용 스레드풀 — 톰캣 워커 보호 (05 §5-2)
@EnableScheduling   // analyze_job watchdog·야간 배치 (13 §6)
public class JjikbokaApplication {
    public static void main(String[] args) {
        SpringApplication.run(JjikbokaApplication.class, args);
    }
}
