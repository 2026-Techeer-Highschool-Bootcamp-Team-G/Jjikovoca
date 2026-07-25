# 멀티스테이지 (13 §10) — 빌드 캐시 최대화 후 런타임 슬림
# 1) build: gradle 캐시 레이어 분리(의존만 먼저) → 소스 변경 시 재다운로드 없음
FROM gradle:8.10-jdk21 AS build
WORKDIR /workspace
COPY settings.gradle.kts build.gradle.kts gradle.properties ./
RUN gradle dependencies --no-daemon || true
COPY . .
RUN gradle bootJar --no-daemon -x test

# 2) runtime: JRE만 — 이미지 축소·공격면 감소
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
# 비루트 실행 (08 §7 보안 베이스라인) + 로컬 저장 디렉토리(app.image.dir·export.dir = ./data/*) 쓰기 권한.
# 명명 볼륨(server-data)이 /app/data에 처음 마운트될 때 이 소유권(spring)을 승계한다.
RUN useradd -r -u 1001 spring && mkdir -p /app/data && chown -R spring:spring /app
USER spring
COPY --from=build --chown=spring:spring /workspace/build/libs/app.jar app.jar
EXPOSE 8000
# 컨테이너 메모리 인지 힙 (t3.small 등 소형 인스턴스)
ENTRYPOINT ["java","-XX:MaxRAMPercentage=75.0","-jar","app.jar"]
