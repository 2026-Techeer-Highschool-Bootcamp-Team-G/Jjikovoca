# 02. `docker compose up` 하면 server·nginx가 안 뜨는 이유 (`full` 프로필)

## 의문
`docker compose up` 하면 `mysql`·`redis`만 뜨고 `server`·`nginx`는 안 뜬다. 오류인가?

## 답 — 오류가 아니라 의도된 설계
`docker-compose.yml`에서 서비스가 두 그룹으로 나뉜다:
```yaml
mysql:  # profiles 없음  → 항상 뜸
redis:  # profiles 없음  → 항상 뜸
server: profiles: ["full"]   # --profile full 일 때만
nginx:  profiles: ["full"]   # --profile full 일 때만
```
**profiles가 붙은 서비스는 그 프로필을 명시할 때만 실행된다.** 그래서 기본 `docker compose up`은 프로필 없는 mysql·redis만 띄운다.

## 왜 이렇게 나눴나 — "개발에 필요한 것"과 "통합 때만 필요한 것" 분리

| 그룹 | 서비스 | 언제 필요? |
|---|---|---|
| 기본 | `mysql`·`redis` | **항상** — 앱을 IDE로 돌리든 docker로 돌리든 DB·캐시는 늘 필요 |
| `full` | `server`·`nginx` | **통합 실행 때만** — 전체 스택을 docker로 올려볼 때 |

### server를 `full`로 뺀 이유 — 개발 속도
백엔드는 코드를 자주 바꾸고 재기동한다. server를 docker에 넣으면 코드 한 줄 고칠 때마다:
```
소스 수정 → 이미지 재빌드(gradle bootJar, 수십 초~분) → 컨테이너 재시작
```
이 반복이 개발을 느리게 한다. 대신 **IDE에서 `./gradlew bootRun`** 하면 즉시 재기동·핫 리로드·**디버거(브레이크포인트)** 연결이 된다. 그래서 개발 중엔 인프라만 docker, 앱은 로컬 실행이 훨씬 빠르다.

### nginx도 `full`인 이유
nginx는 **리버스 프록시(운영용)** 다 — TLS 종단·도메인 라우팅·rate limit. 개발 중엔 `localhost:8080`으로 앱에 직접 붙으니 필요 없다. 배포처럼 통합 검증할 때만 쓴다.

## 실행법

```bash
# 개발 (평소) — 인프라만 docker, 앱은 로컬
docker compose up -d mysql redis
./gradlew bootRun

# 통합/배포 리허설 — server·nginx까지 전부 docker
docker compose --profile full up --build
```
> ⚠️ `--profile full`로 nginx를 띄우려면 `nginx.conf`가 있어야 한다(현재 미작성). 없으면 nginx 컨테이너가 실패한다.

## "그럼 개발 중 nginx는 어떻게 실행하나?" → 실행하지 않는다
개발 중 클라이언트(브라우저·Postman·프론트 dev server)는 `localhost:8080`에 직접 붙으면 된다. nginx의 upstream은 "server가 어디 있냐"에 묶여서(개발=호스트 `host.docker.internal:8080`, 통합=`server:8080`) 개발 중 억지로 끼우면 오히려 복잡하다. 프론트–백엔드 CORS는 nginx가 아니라 **Vite dev server의 proxy** 로 해결한다.

관련: [01 docker MySQL 연결 실패](./01-docker-mysql-연결실패.md)
