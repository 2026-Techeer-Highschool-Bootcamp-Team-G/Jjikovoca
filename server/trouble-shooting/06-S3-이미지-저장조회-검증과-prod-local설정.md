# 06. S3 이미지 저장·조회 검증 & 저장소 모드(local↔s3) 함정

> 결론: **S3 저장·조회 워크플로우는 정상 동작**한다(저장→S3→조회 왕복이 바이트 단위로 일치). 다만 **저장소 모드가 어떻게 켜지는지**에 두 가지 함정이 있어 기록한다. (프로덕션 S3 전환은 우선순위 밖 — 아래 "미룬 작업" 참고)

## 구조 요약

| 요소 | 파일 | 역할 |
|---|---|---|
| 계약 | `app/image/ImageStorageService` | `save`/`readBytes`/`load` — 저장소 무관 인터페이스 |
| 로컬 | `LocalImageStorageService` | `storage=local`(기본). `./data/images`에 파일로 |
| S3 | `S3ImageStorageService` | `@ConditionalOnProperty(app.image.storage=s3)`일 때만 활성. 키=`{uuid}.{ext}` |
| S3 배선 | `S3Config` | `storage=s3`일 때만 `S3Client` 빈. 리전=설정, 자격=`DefaultCredentialsProvider`(env·프로파일·IAM 롤) |
| 서빙 | `ImageController` | `GET /images/{file}` → `load` (SecurityConfig에서 `/images/**` permitAll) |

- 저장 흐름: 접수(`AnalyzeService.saveCrops`) → `imageStorageService.save(base64)` → 크롭·지문 업로드 → 카드 `image_path`=크롭 키.
- 조회 흐름: `GET /images/{key}` → `imageStorageService.load(key)` → S3 `getObject`.

## 검증 결과 (실 S3, 버킷 `jjikovoca-s3` / ap-northeast-2)

s3 모드로 bootRun 후:

| 항목 | 결과 |
|---|---|
| 저장 | analyze 접수 → 버킷 객체 **+2**(크롭+지문) putObject ✅ |
| 조회(신규) | `GET /images/{저장키}` → **200**, `image/png`, 유효 PNG, **원본 바이트 완전 일치** ✅ |
| 조회(기존) | 기존 객체도 `/images/{key}` → **200** ✅ |
| 부재 | 없는 키 → **404**(Optional.empty 처리) ✅ |
| 자격증명 | `aws sts get-caller-identity` = user `Jjikovoca-s3` 정상, `DefaultCredentialsProvider`가 `~/.aws`에서 해결 |

검증용 s3 명령(참고):
```bash
# 자격·버킷
aws sts get-caller-identity
aws s3 ls s3://jjikovoca-s3/ --recursive | wc -l
# 저장 전후 diff로 신규 키 확인 → /images 로 조회 → 바이트 비교
aws s3 cp "s3://jjikovoca-s3/<key>" /tmp/orig --quiet
curl -s -o /tmp/served "http://localhost:8003/images/<key>"
cmp /tmp/orig /tmp/served && echo OK
```

> ⚠️ zsh 함정: `for k in $NEW`는 **개행 분할이 안 된다**(zsh는 unquoted 변수를 IFS 분할 안 함). 여러 키를 돌 땐 `echo "$NEW" | while IFS= read -r k; do ...` 사용.

## 함정 ① — bootRun은 `.env`를 자동 로드하지 않는다

- `.env`(`APP_IMAGE_STORAGE=s3` 등)는 **docker compose만** 읽는다. `./gradlew bootRun`은 안 읽는다.
- 그래서 그냥 bootRun하면 `application.yml` 기본값 `${APP_IMAGE_STORAGE:local}` → **local 모드**로 뜬다(이미지가 S3가 아니라 `./data/images`로 감).
- 로컬에서 S3로 개발하려면 **환경변수를 직접 주입**:
```bash
APP_IMAGE_STORAGE=s3 APP_IMAGE_S3_BUCKET=jjikovoca-s3 APP_IMAGE_S3_REGION=ap-northeast-2 \
  ./gradlew bootRun
# 자격증명은 DefaultCredentialsProvider가 ~/.aws 또는 AWS_* env에서 해결
```

## 함정 ② — 프로덕션(EC2) 배포는 현재 `local` 저장

- 배포 레포 `docker-compose.prod.yml`이 `APP_IMAGE_STORAGE: local`로 설정돼 있다(초기 "이미지 local 저장" 결정).
- 즉 **배포된 백엔드는 이미지를 컨테이너 볼륨에 로컬 저장**하며 S3를 쓰지 않는다. 로컬 개발(s3)과 프로덕션(local)이 다르다는 점에 유의.

## 미룬 작업 — 프로덕션 S3 전환 (우선순위 밖)

프로덕션도 S3를 쓰려면:
1. `docker-compose.prod.yml`: `APP_IMAGE_STORAGE: s3` + `APP_IMAGE_S3_BUCKET`/`APP_IMAGE_S3_REGION`.
2. 컨테이너에 **AWS 자격 부여**:
   - 권장: **EC2 IAM 인스턴스 롤**(S3 read/write 정책) — 키를 이미지·env에 안 넣음(15 §7 정합).
   - 대안: env `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`(`.env`, gitignore).
3. 로컬 볼륨 저장분 마이그레이션 필요 여부 검토(기존 `/app/data/images` → S3 업로드).

> 전환 시 `/github-issue-pr-workflow`로 배포 설정 변경 진행(IAM 롤 방식 권장).
