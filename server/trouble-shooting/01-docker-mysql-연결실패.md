# 01. bootRun 시 MySQL 연결 실패 (`Communications link failure`)

## 증상
`./gradlew bootRun` 실행 시 앱이 뜨다가 종료된다.
```
Caused by: java.net.ConnectException: Connection refused
com.mysql.cj.exceptions.CJCommunicationsException: Communications link failure
... to localhost:3306
Flyway → Unable to obtain connection from database → entityManagerFactory 생성 실패 → 앱 종료
```

## 원인
앱은 `application-local.yml`의 `localhost:3306` MySQL에 붙으려는데, **3306에 MySQL이 없다.** 두 가지 경우가 있다.

### ① 로컬 설치 MySQL이 3306을 점유 → docker MySQL이 못 뜸
- macOS에 dmg로 설치된 MySQL(`/usr/local/mysql/bin/mysqld`)이 시스템 데몬으로 3306을 잡고 있음.
- 이 상태에서 `docker compose up` 하면:
  ```
  Error response from daemon: ports are not available:
  exposing port TCP 0.0.0.0:3306 ... bind: address already in use
  ```
  → docker `mysql` 컨테이너가 기동 실패(redis만 뜸).

### ② docker MySQL이 종료됨
- `docker compose up`(**foreground**, `-d` 없이)으로 띄운 뒤 그 터미널을 닫거나 `Ctrl+C` → 컨테이너가 같이 죽음(`Exited (137)`).
- 그 뒤 bootRun 하면 붙을 MySQL이 없어 `Connection refused`.

## 해결

### 로컬 MySQL이 3306을 점유한 경우 → 로컬 MySQL 중지
```bash
sudo /usr/local/mysql/support-files/mysql.server stop
# 또는: 시스템 설정 → MySQL → Stop MySQL Server
```
> 매번 자동 기동이 귀찮으면 시스템 설정 MySQL 패널에서 "컴퓨터 시작 시 MySQL 시작" 체크 해제.

### docker 인프라를 백그라운드로 기동
```bash
cd server
docker compose up -d mysql redis   # ← -d (백그라운드)가 핵심
./gradlew bootRun
```

## 예방
- **인프라는 항상 `-d`로 띄운다**: `docker compose up -d mysql redis`
  - foreground(`docker compose up`)는 터미널을 점유하고, 종료하면 컨테이너도 죽는다.
- 상태 확인:
  ```bash
  docker compose ps                              # Up / healthy 확인
  lsof -nP -iTCP:3306 -sTCP:LISTEN               # 3306 리스닝 확인
  ```
- 로컬 MySQL과 docker MySQL을 **동시에 쓰지 않는다**(3306 충돌). 굳이 병행하려면 docker를 `3307:3306`으로 바꾸고 `application-local.yml`도 3307로.

## 개발 표준 흐름
```bash
docker compose up -d mysql redis   # 인프라만, 한 번 띄우면 계속 유지
./gradlew bootRun                  # 앱은 IDE/터미널에서 (여러 번 재기동 가능)
```
앱(server)·nginx를 docker로 함께 올리는 `--profile full`은 통합/배포 리허설용이다 → [02 문서](./02-docker-compose-full-프로필.md) 참고.
