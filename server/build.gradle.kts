// 단일 모듈 모놀리스 — 실행 이미지 하나(app.jar). 도메인 경계는 패키지+ArchUnit이 강제(13 §2).
plugins {
    java
    id("org.springframework.boot") version "3.3.2"
    id("io.spring.dependency-management") version "1.1.6"
}

group = "com.jjikboka"
version = "0.0.1-SNAPSHOT"

java {
    toolchain { languageVersion.set(JavaLanguageVersion.of(21)) }
}

repositories { mavenCentral() }

dependencies {
    // 웹·보안·영속 (auth·core 전 도메인 공용)
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    // Redis 캐시-어사이드 (13 §9) — 15 스케일아웃 시 SSE pub/sub 팬아웃도 이 위에
    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    // analysis — Gemini REST(WebClient)
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    // 관측 — /actuator/health가 15 §2 k8s readiness/liveness probe가 됨
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("io.micrometer:micrometer-registry-prometheus")
    // 마이그레이션 — Flyway가 스키마 소유 (08 §6)
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-mysql")
    // JWT 무상태 (13 §5 · 15 §7 불변식)
    implementation("io.jsonwebtoken:jjwt-api:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")
    runtimeOnly("com.mysql:mysql-connector-j")

    // 경계 검증 + 통합 테스트 (Testcontainers — H2 금지, 08 §3)
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("com.tngtech.archunit:archunit-junit5:1.3.0")
    testImplementation("org.testcontainers:mysql")
    testImplementation("org.testcontainers:junit-jupiter")
}

tasks.withType<Test> { useJUnitPlatform() }

tasks.named<org.springframework.boot.gradle.tasks.bundling.BootJar>("bootJar") {
    archiveFileName.set("app.jar")
}
