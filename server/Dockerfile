# 멀티스테이지 (13 §10) — 빌드 캐시 최대화 후 런타임 슬림
# 1) build: gradle 캐시 레이어 분리(의존만 먼저) → 소스 변경 시 재다운로드 없음
FROM gradle:8.10-jdk21 AS build
WORKDIR /workspace
COPY settings.gradle.kts build.gradle.kts gradle.properties ./
RUN gradle dependencies --no-daemon || true
COPY . .
RUN gradle bootJar --no-daemon -x test

# 2) runtime: JRE 21 + headless Chromium(내보내기 PDF 렌더) — Java 21 바이트코드 실행 위해 temurin 21 유지.
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# 비루트 실행 (08 §7 보안 베이스라인) + 로컬 저장 디렉토리(app.image.dir·export.dir = ./data/*) 쓰기 권한.
# 명명 볼륨(server-data)이 /app/data에 처음 마운트될 때 이 소유권(spring)을 승계한다.
RUN useradd -r -u 1001 spring && mkdir -p /app/data && chown -R spring:spring /app

COPY --from=build --chown=spring:spring /workspace/build/libs/app.jar app.jar

# Chromium 브라우저를 고정 경로에 설치(PLAYWRIGHT_BROWSERS_PATH). PDF 내보내기(chromium 렌더러)에서만 쓴다.
# --with-deps가 Chromium 구동 라이브러리를 apt로 깔고, 한글 폰트(Nanum·Noto CJK)는 렌더 깨짐 방지로 별도 설치.
# fat jar의 Playwright CLI를 PropertiesLauncher로 실행(loader.main) — BOOT-INF/lib이 클래스패스에 오른다(Boot 3.2+).
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN apt-get update \
    && apt-get install -y --no-install-recommends fonts-nanum fonts-noto-cjk \
    && java -Dloader.main=com.microsoft.playwright.CLI -cp app.jar \
         org.springframework.boot.loader.launch.PropertiesLauncher install --with-deps chromium \
    && chown -R spring:spring /ms-playwright \
    && rm -rf /var/lib/apt/lists/*

USER spring
EXPOSE 8000
# 컨테이너 메모리 인지 힙 (t3.small 등 소형 인스턴스). Chromium 동시 렌더는 드물어 별도 상한 없이 둔다.
ENTRYPOINT ["java","-XX:MaxRAMPercentage=75.0","-jar","app.jar"]
