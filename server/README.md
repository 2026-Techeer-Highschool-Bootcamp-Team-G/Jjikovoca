# 찍어보카 백엔드 (jjikboka-server)

**단일 모듈 모놀리스** — 하나의 실행 이미지(`app.jar`)로 배포하고, 도메인 경계는 패키지 + Spring Modulith가
빌드에서 강제한다. MSA는 하지 않으며(문서 15), 쿠버네티스는 이 단일 이미지를 레플리카 N개로 복제하는
방식이라 멀티모듈이 필요 없다. 설계 근거는 `../../context/13_백엔드_초기세팅_찍어보카.md`,
스케일아웃 로드맵은 `../../context/15_쿠버네티스_도입_로드맵_찍어보카.md`, 스키마는
`../../context/03_ERD_MySQL.md`(v1.9).

## 패키지 구조 (13 §2)

```
server/
├── build.gradle.kts        단일 빌드 (실행 jar = app.jar)
├── settings.gradle.kts
└── src/main/java/com/jjikboka/
    ├── JjikbokaApplication.java   진입점
    ├── common/         공용 기술 인프라(응답·에러·이벤트·이미지·헬스·설정) — 도메인 무의존
    ├── auth/           인증·계정·토큰, Security 설정
    ├── card/           카드 애그리거트(캡처·피드·보관함·Leitner 복습·클로즈)
    ├── exam/           시험 등록·D-day·태깅
    ├── analysis/       AI 분석 워커·한도 차감/환불
    ├── stats/          리포트·경험치·랭킹·잔디
    ├── studylog/       학습 로그 원장·집계
    ├── quota/          일일 AI 분석 한도
    ├── subscription/   프리미엄 구독
    ├── export/         내보내기(PDF/HTML)
    ├── notification/   알림
    ├── study/          학습 세션 API(복습 큐·클로즈 풀이·추천)
    ├── wordbook/       단어장 API(피드·보관함·태그·연상 이미지)
    └── me/             내 정보 조회
```

모듈 안은 `controller` · `service` · `dto`(필요하면 `entity` · `repository`)로 나눈다.

경계 규칙: 모듈 간 허용 의존은 각 모듈 `package-info.java`의 `@ApplicationModule(allowedDependencies)`가 정하고,
`ModularityTest`(Spring Modulith `verify()`)가 순환·허용되지 않은 의존·내부 패키지(entity·repository) 접근을
빌드에서 막는다. `ArchitectureTest`는 `common`이 도메인 모듈을 참조하지 못하게 추가로 막는다.

## 부트스트랩 (최초 1회)

**JDK 21 필수.** Gradle 8.10은 Java 23까지만 지원하므로 JDK 24/25로는 Gradle 자체가 뜨지 않는다.
`JAVA_HOME`을 21로 고정하라 (예: `export JAVA_HOME=$(/usr/libexec/java_home -v 21)`).

Gradle wrapper JAR은 최초 부트스트랩 시 한 번 생성됐다면 저장소에 포함된다. 없다면:

```bash
cd server
gradle wrapper --gradle-version 8.10   # gradlew·gradle-wrapper.jar 생성 (이후 커밋)
cp .env.example .env
```

## 개발 루프 (13 §8-3)

```bash
docker compose up -d mysql redis   # 인프라만 (파일명이 docker-compose.yml이라 -f 불필요)
./gradlew bootRun                  # 앱은 IDE/터미널
```

- 앱 기동 시 Flyway가 `V1__baseline.sql`을 적용(스키마는 Flyway 소유, JPA는 `validate`만).
- 헬스: `curl localhost:8080/actuator/health` (Redis 상태 포함 · 15 §2 k8s probe가 될 엔드포인트).
- Gemini 키가 없으면 `GEMINI_MOCK=true`(기본)로 모의 AI 모드 — 팀원 온보딩에 키 불필요.

## 통합 실행 (전체 스택)

```bash
docker compose --profile full up -d --build   # +server +nginx
```

## 빌드·테스트

```bash
./gradlew build       # 컴파일 + 모듈 경계 테스트(Modulith·ArchUnit)
./gradlew bootJar     # 실행 jar → build/libs/app.jar
```

> 통합 테스트는 Testcontainers(실제 MySQL)로 돈다 — H2 대체 금지(08 §3). Docker 데몬 필요.

## 다음 단계

지금은 **뼈대**(패키지 경계·설정·스키마)만 있다. 도메인 코드는 웹(FSD)과 짝을 맞춰
04 API 명세서 순서(auth → card → review → stats → analysis)로 이관한다. 각 도메인 소유 테이블은
`package-info.java` 참조. `analyze_job.user_id`는 크로스 경계라 FK 없이 값+인덱스만 둔다(13 §4).

## 미래 확장을 위한 불변식 (15 §7 — 지금부터 깨지 않기)

k8s 스케일아웃을 매끄럽게 하려면 아래만 지키면 된다(전부 이미 반영됨):
세션·상태를 앱 메모리에 두지 않기(JWT 무상태) · 파일을 로컬 디스크에 쓰지 않기(S3) ·
설정·시크릿을 이미지에 굽지 않기(환경변수 주입) · `/actuator/health` 유지.
