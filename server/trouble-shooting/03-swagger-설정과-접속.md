# 03. Swagger UI 접속과 설정

## 접속 URL (앱이 `localhost:8080`에 떠 있을 때)

| 용도 | URL |
|---|---|
| **Swagger UI** (화면) | **http://localhost:8080/swagger-ui.html** |
| (리다이렉트 목적지) | http://localhost:8080/swagger-ui/index.html |
| **OpenAPI 문서** (JSON) | http://localhost:8080/v3/api-docs |
| OpenAPI 문서 (YAML) | http://localhost:8080/v3/api-docs.yaml |

→ **`http://localhost:8080/swagger-ui.html`** 이 그 화면이다. 여기서 API를 바로 시험할 수 있다.

## JWT 인증이 필요한 API 시험법
1. `POST /api/auth/login` 으로 `accessToken` 획득
2. Swagger UI 우측 상단 **Authorize** 버튼 클릭
3. `Bearer {accessToken}` 입력 (또는 스킴에 따라 토큰만)
4. 이후 인증 필요 API(로그아웃 등)가 `Authorization` 헤더와 함께 호출됨

## 설정이 있는 곳 (`server/`)

| 파일 | 역할 |
|---|---|
| `build.gradle.kts` | `org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0` 의존성 |
| `src/main/java/com/jjikboka/app/config/OpenApiConfig.java` | OpenAPI 정의 — 제목("찍어보카 API")·버전 + **JWT Bearer 보안 스킴**(Authorize 버튼) |
| `src/main/java/com/jjikboka/app/config/SecurityConfig.java` | `/swagger-ui/**`·`/swagger-ui.html`·`/v3/api-docs/**`를 인증 예외(permitAll) |

> 위 URL은 **springdoc 기본 경로**다. `application.yml`에 별도 커스텀을 넣지 않았다.

## 경로를 바꾸고 싶으면 (`application.yml`)
```yaml
springdoc:
  swagger-ui:
    path: /docs          # 기본 /swagger-ui.html
  api-docs:
    path: /api-docs      # 기본 /v3/api-docs
```

## 프로덕션 주의
prod에서 Swagger 노출 여부는 보안상 별도 결정한다. 끄려면:
```yaml
springdoc:
  api-docs:
    enabled: false       # prod 프로파일에서
```
또는 경로를 인증 뒤로 보호한다.

## 안 열릴 때 체크
- 앱이 실제로 `8080`에 떠 있는가 (`curl -s localhost:8080/v3/api-docs | head`)
- SecurityConfig에서 swagger 경로가 permitAll인가 (아니면 401)
- 포트를 바꿨다면 URL의 8080도 함께 변경
