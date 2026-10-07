# 동기화 불변 규칙 (반영할 때마다 지킨다)

## 1. 반영 순서와 그 이유

**02 → 03 → 04 → 17**. 앞 문서가 뒤 문서의 어휘를 정하기 때문이다:

- 02가 기능과 그 조건을 정의 → 03이 그걸 담을 데이터 모양(컬럼·타입·enum)을 정함
- 03의 컬럼·enum 값을 04가 요청/응답 필드로 그대로 인용
- 04의 엔드포인트·상태를 17이 화면 전환으로 그림

같은 개념은 **모든 문서에서 같은 이름·같은 값**으로 적어라. 예: 정답 형식을 02에서
`NUMERIC / CHOICE`로 정했으면 03 CHECK 제약, 04 요청 필드, 17 화면 설명이 전부 그 표기를 쓴다.
한 곳이라도 `EXPRESSION` 같은 옛 값이 남으면 계약 불일치다.

## 2. 버전 증가 + 변경 이력

각 문서 상단에는 보통 `| 버전 | vX.Y (날짜) — 요약 |` 형태의 헤더 표가 있다.
- 고친 문서마다 버전을 **한 단계 올린다**(기능 추가·구조 변경=마이너 v1.8→v1.9, 큰 개정은 판단).
- 변경 이력 줄(헤더 표의 버전 셀 또는 별도 변경 이력 섹션)에 **무엇을 왜** 한 줄 추가.
- 날짜는 **절대표기**(2026-07-23). "오늘/어제" 금지 — 나중에 읽으면 언제인지 모른다.
- 여러 문서를 한 변경으로 고칠 때 **날짜와 요약 문구를 통일**하면 추적이 쉽다.

## 3. sqlglot DDL 검증 (03의 DDL을 바꿨을 때만, 필수)

03의 `CREATE TABLE`/컬럼/CHECK/인덱스를 수정했으면 **구문이 깨지지 않았는지 반드시 파싱 검증**한다.

```bash
# venv는 재사용 (없으면 최초 1회 생성)
python3 -m venv /tmp/sqlglot_venv 2>/dev/null
/tmp/sqlglot_venv/bin/pip install -q sqlglot 2>/dev/null

# 검증: 바꾼 DDL 블록을 MySQL 방언으로 파싱
/tmp/sqlglot_venv/bin/python3 -c "
import sqlglot
ddl = '''<여기에 수정한 CREATE TABLE ... 블록>'''
for stmt in sqlglot.parse(ddl, read='mysql'):
    if stmt: print('OK:', stmt.this.this.name if hasattr(stmt,'this') else stmt.key)
"
```

- 파싱 에러가 나면 구문 오류 — 고치기 전까지 반영을 완료로 보지 마라.
- 다이어그램(mermaid erDiagram)도 DDL과 컬럼/관계가 일치하는지 눈으로 확인.
- 03에는 보통 §0 리팩터링 요약·§4 규칙·다이어그램이 함께 있다 — DDL만 고치고 이들을 빠뜨리지 마라.

## 4. 깨지기 쉬운 도메인 불변식 (변경이 닿으면 재확인)

- **비노출 계약**: `card.answer_value`는 03에 컬럼으로 존재하되 04 조회 응답에는 **절대 미포함**
  (치팅 방지). 판정 후에만 공개. 관련 필드(선택지 뜻 등)도 "판정 후 공개" 규칙.
- **쿼터 원자성**: 무료 일 5회 차감은 조건부 UPDATE로 원자적(동시 요청에도 정확히 차단) — NFR-02.
- **소유·FK 규칙(13 §4 완화판)**: 단일 스키마라 도메인 간 FK는 유지 가능하나, 도메인 간 조인은
  지양. `analyze_job.user_id`는 비동기 워커 경계라 FK 없이 값+인덱스.
- **STI(card)**: `type`(WORD/PROBLEM)에 따라 워드/문제 전용 컬럼이 nullable — 앱 계층에서 검증.
- **premium은 계산값**: app_user에 premium 컬럼 없음. subscription status+expires_at로 판정,
  04 응답의 premium은 계산 결과.

## 5. 환경 주의 (이 프로젝트 특유)

- 문서는 git 루트(`Jjikovoca/Jjikovoca/`)가 아니라 그 **상위** `Jjikovoca/context/`에 있다.
- **Bash가 /tmp에 갇혀** Desktop 경로 접근이 실패하면 `dangerouslyDisableSandbox: true`로 실행.
- 문서 편집은 **Read/Edit 도구 + 절대경로**가 가장 안전(Desktop 쓰기가 Bash에선 막힐 수 있음).
- 큰 문서는 필요한 구간만 offset/limit로 읽어 편집 — 전체를 매번 다 읽지 않는다.

## 6. 범위 밖이지만 리마인드할 것

Figma(fileKey `ZD5gMYgz1Buv59QMMf4zWg`)와 Notion(요구사항 페이지·API 명세 페이지·엔드포인트 DB)은
이 스킬이 자동으로 건드리지 않는다. 하지만 변경이 화면 UI나 팀 공유 문서에 닿으면 반영 요약
끝에 **"다음 수동 단계"**로 어느 화면·어느 페이지를 손봐야 하는지 짚어라. 팀이 놓치지 않게.
