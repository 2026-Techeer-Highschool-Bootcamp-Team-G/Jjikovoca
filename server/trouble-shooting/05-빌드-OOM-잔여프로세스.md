# 05. 빌드가 진행 중 계속 죽음 (OOM — 잔여 Gradle 데몬·bootRun + Testcontainers)

## 증상
`./gradlew build`가 **즉시 실패가 아니라(04와 다름) 진행 중 갑자기 죽는다.** 재시도해도 반복.
- 컴파일/테스트 도중 프로세스가 사라지거나(`Killed: 9`), 데몬이 `disappeared`/`unexpectedly`로 끊김.
- 캐시로 up-to-date인 빈 빌드(`build`가 전부 UP-TO-DATE)는 통과하는데, **실제 컴파일·테스트가 도는 clean 빌드에서 죽는다.**

> 04는 "Gradle이 2초 만에 `What went wrong: 25`로 **즉시 실패**"(데몬이 아예 못 뜸). 05는 **데몬은 21로 정상 기동**하나 도중에 죽는 별개 문제다.

## 원인 — 메모리 고갈(OOM)
빌드 자체·코드는 정상이다(아래 해결 후 전체 테스트 포함 clean build 23초 성공). 죽던 시점의 **환경 상태**가 문제였다:

1. **`JAVA_HOME`이 JDK 25.** 프로젝트는 데몬을 JDK 21로 고정(→ 04, `gradle-daemon-jvm.properties`)하므로, 25 셸에서 빌드하면 JVM이 갈린다:
   - **런처 JVM = JDK 25**(JAVA_HOME) + **데몬 JVM = JDK 21**(자동 탐색) → JVM이 하나 더 뜬다.
   - 런처/데몬 불일치·데몬 사망으로 **Gradle 데몬이 계속 새로 생성돼 쌓인다**(실측: temurin-21 데몬 **3개** + jdk-25 런처 1개 동시 존재).
2. **E2E로 띄운 `bootRun`(포트 8000)** 이 Spring 앱을 통째로 메모리에 물고 있었다.
3. **통합테스트(Testcontainers)** 가 `test` 단계에서 **MySQL·Redis 컨테이너**를 띄운다.
4. 그 결과 **free 메모리가 ~21MB까지** 떨어져, OS가 빌드 JVM/컨테이너를 **OOM-kill** → 빌드가 죽는다. 메모리가 빠듯하니 재시도할 때마다 데몬이 또 죽고 새로 뜨는 **악순환**.

## 해결
아래를 순서대로 하면 해소된다(실측: 전체 테스트 포함 clean build 23초 성공).
```bash
# 1) JAVA_HOME을 21로 — 런처·데몬을 21로 일치시켜 데몬 churn 제거 (근본 처방)
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
java -version   # "21.0.x" 확인

# 2) 쌓인 스테일 Gradle 데몬 전부 정리
cd server && ./gradlew --stop

# 3) 빌드 전, E2E로 띄운 leftover bootRun 종료(메모리 최대 확보)
pkill -f JjikbokaApplication

# 4) 빌드
./gradlew build
```
- **효과가 가장 큰 것**: (1) JAVA_HOME을 21로 두는 것 + (3) 빌드 중 `bootRun`을 띄워두지 않는 것.
- `.zshrc`에 `export JAVA_HOME=$(/usr/libexec/java_home -v 21)`를 넣어 셸 기본 JDK를 21로 두면 재발을 막는다. Java 25가 필요하면 그 셸에서만 쓴다.

## 예방
- **서버 빌드는 JDK 21 셸에서** 한다(JDK 25 런처는 Gradle 8.10 미지원이라 불안정).
- **bootRun을 빌드와 동시에 띄워두지 않는다** — 별도 터미널에서 돌리고, 빌드할 땐 종료.
- 메모리가 근본적으로 부족하면:
  - 다른 앱 종료로 여유 확보.
  - `./gradlew build -x test`로 컴파일만 먼저 하고, `./gradlew test`를 따로 돌려 **컨테이너 동시 부하를 낮춘다**.
  - Docker Desktop 리소스(메모리) 상향.

## 진단 팁
```bash
# 쌓인 데몬·leftover 앱 확인
ps aux | grep -iE "JjikbokaApplication|GradleDaemon|gradle" | grep -v grep
lsof -nP -iTCP:8000 -sTCP:LISTEN            # bootRun 점유 확인
vm_stat | grep "Pages free"                # free 메모리(페이지×16KB)
/usr/libexec/java_home -V                   # 설치된 JDK 목록(현재 JAVA_HOME 포함)
./gradlew --version                         # Launcher JVM / Daemon JVM 확인
```

## 관련
- **04** (`./gradlew` 즉시 실패 — JDK 21 데몬 고정): 그 설정(`gradle-daemon-jvm.properties`)이 되어 있어도 **이 OOM은 별개**로 발생한다.
- **01** (docker MySQL): Testcontainers는 별도 컨테이너를 띄우므로 로컬 인프라와 무관하지만, 메모리는 함께 압박한다.
