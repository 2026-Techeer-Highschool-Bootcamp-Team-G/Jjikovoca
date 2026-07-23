# 04. `./gradlew` 실행 실패 (`What went wrong: 25`)

## 증상
`./gradlew`(bootRun·build 등) 실행 시 **2초 만에** 즉시 실패한다.
```
FAILURE: Build failed with an exception.
* What went wrong:
25
BUILD FAILED in 2s
```
`* What went wrong:` 아래의 **"25"는 Java 25**를 뜻한다.

## 원인
- **Gradle 8.10은 Java 23까지만** 지원한다.
- 로컬 기본 JVM(`JAVA_HOME`)이 Java 24/25면, Gradle 자체가 그 버전을 몰라 기동하지 못한다.
- `(base)` 프롬프트(conda)나 맥 기본 셸의 JVM이 최신(25)으로 잡혀 있으면 발생한다.

> `build.gradle.kts`의 `toolchain { languageVersion = 21 }`은 **컴파일 타깃**이고,
> **Gradle을 실행하는 JVM**은 별개다. Gradle 실행 JVM 자체가 21이어야 한다.

## 해결 (프로젝트 고정 — 채택된 방식)
`server/gradle/gradle-daemon-jvm.properties`:
```properties
toolchainVersion=21
```
- Gradle 8.8+의 **Daemon JVM criteria** 기능.
- **경로가 아니라 버전만** 지정 → 각 머신에 설치된 JDK 21을 Gradle이 자동 탐색(이식적, 커밋 안전).
- 이 파일이 있으면 **Java 25 셸에서도** Gradle이 알아서 21 데몬으로 실행된다.
- 전제: 각 머신에 **JDK 21 설치**(이 프로젝트 필수 버전).

## 임시 해결 (셸에서 한 번만)
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
java -version        # "21.0.x" 확인
./gradlew bootRun
```

## 검증 방법
```bash
unset JAVA_HOME            # 시스템 기본(Java 25) 상황 재현
cd server && ./gradlew help
# → java version "25" 인 셸에서도 BUILD SUCCESSFUL (Gradle이 자동 21 사용)
```

## 참고
- 설치된 JDK 목록: `/usr/libexec/java_home -V`
- JDK 21이 없으면 설치(예: Eclipse Temurin 21).
- CI는 이 파일과 별개로 자체 JDK 설정을 쓴다.

관련: 이 규칙은 README의 "JDK 21 필수" 주의와 문서 13(백엔드 초기 세팅)에도 명시돼 있다.
