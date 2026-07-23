# 찍어보카 백엔드 (jjikboka-server)

**단일 모듈 모놀리스** — 하나의 실행 이미지(`app.jar`)로 배포하고, 도메인 경계는 패키지 + ArchUnit이
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
    ├── app/        조립 — main() · Security(JWT)/Redis 설정
    ├── auth/       회원·로그인·JWT (F-01)
    ├── core/       card · review · stats (F-02~13/19/26/29) — 한 배포 묶음, 상호 참조 허용
    ├── analysis/   Gemini·폴백·analyze_job (F-03/18)
    └── shared/     에러 규약·이벤트 DTO (도메인 로직 금지)
```

경계 규칙: `auth` / `core` / `analysis`는 서로 참조하지 않는다. `shared`는 도메인을 모른다.
@Entity는 패키지 밖 비공개. — `src/test/.../ArchitectureTest.java`가 빌드에서 위반을 차단한다
(경계 강제는 멀티모듈 없이 ArchUnit만으로 유지된다).

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
./gradlew build       # 컴파일 + ArchUnit 경계 테스트
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
