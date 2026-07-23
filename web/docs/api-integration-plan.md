# API 명세 대비 프론트엔드 정합화 로드맵

> 작성 배경: 백엔드 팀이 REST API 명세(45개 엔드포인트, 공통 응답 봉투 `{ success, data, message }`, JWT access+refresh 회전 인증)를 확정했다. 현재 프론트엔드는 대부분 화면이 **파일 내 하드코딩 목업**으로 동작하며 일부는 명세와 다른 전제로 구현되어 있다. 이 문서는 **명세를 고려하지 않고 구현된 부분을 진단**하고 **백엔드 통신에 맞게 수정하는 로드맵**을 정리한다. 실제 코드 수정은 이후 기능별 이슈/PR로 분할 진행한다.
>
> 명세 출처: Notion "🔌 API 엔드포인트 목록" (API 명세서). 공통 규약: 모든 JSON 응답은 `{ success, data, message }` 봉투(이미지·파일 바이너리 예외), 대부분 엔드포인트 `인증 필요`(Bearer access token), 401은 refresh로 재발급.

---

## 0. 현재 인프라 상태 (탐색 결과)

**있는 것 ✅**
- `src/shared/api/client.ts` — `apiFetch`/`apiGet`/`apiPost`, Bearer 토큰 자동 첨부, `ApiError` 정규화.
- `@tanstack/react-query` v5 + `src/app/providers/QueryProvider.tsx` (main에서 래핑).
- 토큰 저장 `localStorage['jjik.token']` (`getToken`/`setToken`/`clearToken`).
- vite 프록시: `/api`·`/images` → `http://localhost:8000`, 베이스 URL `VITE_API_BASE_URL`.
- `src/entities/card/model/types.ts` — **API와 정합한 도메인 타입**(Card, Diagnosis, SolutionStepMeta 등).
- `src/entities/card/api/cardApi.ts` — `fetchCards(subject)`.

**어긋난/없는 것 ❌**
- **응답 봉투 미반영**: `apiFetch`는 JSON을 그대로 반환하고 실패를 `{ error }`로 가정 → 명세는 `{ success, data, message }`. `cardApi.fetchCards`가 `r.cards`를 바로 읽어 **이미 실제 응답과 어긋남**(실제는 `data.cards`).
- **인증**: 단일 `jjik.token`만 저장 → 명세는 `accessToken`+`refreshToken`(회전). 401→refresh 재발급·재시도 없음. 로그인/회원가입/로그아웃 API 미연결, 보호 라우트 없음.
- **react-query 미사용**: 프로바이더만 있고 페이지는 전부 하드코딩 목업.

**정합 ✅ (그대로 재사용)**
- enum: `Subject` ENGLISH/MATH, `CardType` WORD/PROBLEM, `ReasonTag` CONCEPT/MISTAKE/MISREAD/TIME, `Grade` KNOW/CONFUSED/DONT_KNOW, `Card` 필드(boxLevel, graduated, contextMeaning, createdAt …) 모두 명세와 일치.
- 발음: `/api/me/settings`(발음 국가 저장)는 **명세상 폐기(v1.9)** — F-08은 Web Speech 클라 전용. 현재 FE가 서버 저장 없이 미국/영국 버튼 즉시 재생 → **이미 정합**.

---

## A. 기반 공사 (모든 화면의 선행 조건 — Phase 0)

| # | 항목 | 내용 | 대상 파일 |
|---|---|---|---|
| A1 | **응답 봉투 언랩** | `apiFetch`가 `data`를 반환하고 `success:false`면 `message`로 throw. `ApiEnvelope<T> = { success, data, message }` 타입 추가. `cardApi.fetchCards`를 `data.cards`로 수정. | `shared/api/client.ts`, `entities/card/api/cardApi.ts` |
| A2 | **access+refresh 회전** | 로그인/회원가입 응답의 `accessToken`+`refreshToken` 저장, 401 시 `POST /api/auth/refresh`로 재발급 후 원요청 1회 재시도, 실패 시 폐기+로그인 이동. 로그아웃 `POST /api/auth/logout`. | `shared/api/client.ts`, 신규 `features/auth/*`, `pages/login`·`register`, `app/router.tsx`(가드) |
| A3 | **react-query 표준** | 엔티티별 api 모듈 + `useQuery`/`useMutation` 훅, 로딩/에러/빈 상태, 에러 토스트(`message`). 이후 모든 화면의 표준. | `features/*/api`, `shared/ui`(토스트) |
| A4 | **타입 보강** | `StudyActivity = 'RETRY'|'FLASHCARD'|'CLOZE'|'MATH_REVIEW'`, `MathDiagnosis`에 `suggestedReason: ReasonTag` 추가(명세 `diagnosis`와 정합), 학습 기록 api `POST /api/cards/{id}/study`. | `entities/card/model`, `features/math-review/model`, 신규 study api |

---

## B. 기능별 재정합 (명세를 고려하지 않고 구현된 것 — 심각도 순)

### B1. 빈칸 퀴즈 — **가장 큰 괴리** 🔴
- **현재 FE**: 4지선다(`options[4]`) + 정답 클라 내장(`answer`) + `/cloze-correct`·`/cloze-wrong` 로컬 판정.
- **명세**: `GET /api/study/cloze` → **주관식 빈칸** `{ cardId, clozeText("... _ ..."), meaning, hints[] }`, **정답 미포함(치팅 방지)**. 제출 `POST /api/study/cloze/{id}/answer { guess, durationMs }` → **서버 판정** `{ correct, word, cardId, boxLevel, nextReviewAt, graduated }`. 재생성 `POST /api/study/cloze/{id}/regenerate`(프리미엄 + 한도 1회).
- **수정**: `ClozeQuestion` 모델·페이지를 **주관식 입력 + 서버 판정**으로 재작성. 정답/오답 화면은 서버 응답으로 구동(로컬 비교 제거). 힌트는 `hints[]` 사용.
- 파일: `features/cloze/*`, `pages/cloze`·`cloze-correct`·`cloze-wrong`.

### B2. 수학 플로우 — 로컬 판정·비노출 위반 🔴
- **현재 FE**: `answerValue`·`explanation`·모든 단계 `content`를 목업에 내장(비노출 계약 위반), `MathAnswerPage`가 로컬 비교로 판정.
- **명세**: 큐 `GET /api/study/math`(각 단계 `content`·정답·해설 **미포함**) → 단계 공개 `POST /api/study/math/{cardId}/steps/{no}?solutionIndex`(**이때만** `content`) → 판정 `POST /api/study/math/{cardId}/answer { answer, durationMs }`(**판정 후에만** 정답·해설) → 기록 `POST /api/cards/{id}/study { activity:MATH_REVIEW, detail:{ stepsTotal, clickedBeforeRecall[], answerCorrect } }` → 다른 풀이 `POST /api/study/math/{cardId}/solutions`.
- **수정**: 단계 클릭 시 fetch, 서버 판정, MATH_REVIEW 클릭로그 기록으로 재작성. `content`는 목업에서 제거.
- 파일: `features/math-review/*`, `pages/math-review`·`math-answer`·`math-problem`·`math-verdict-*`.

### B3. 플래시카드 — 리치 목업 ↔ 얇은 큐 🟠
- **명세**: `GET /api/study/flashcards?mode=TODAY|PICK&subject&cardIds&limit` → `{ total, cards:[{ id, word, contextMeaning, example, boxLevel }] }`(단일 `example` 문자열; FE의 `pre/highlight/post`·`pos`·`dictNote`·tags **없음**). 채점 `POST /api/cards/{id}/study { activity:FLASHCARD, result, reasonTag?, durationMs }` → `{ cardId, boxLevel, nextReviewAt, graduated }`.
- **수정**: `FlashcardData`를 명세 필드로 매핑(하이라이트는 클라 파생 또는 제거), GradeButtons를 학습 기록에 연결, 졸업 시 `/card-done`.
- 파일: `features/flashcard/*`, `pages/flashcard`·`card-done`.

### B4. 학습 진입 (StudySetupSheet) 🟠
- `onStart(method, type)` → `mode`(TODAY/PICK)·`subject`·`cardIds`로 `/api/study/flashcards` 또는 `/api/study/cloze` 큐 호출.
- AI_RECOMMEND 통계(기억률/개수/예상시간)는 v1 미제공 → **백엔드 요청**(§C). dueCount는 `/api/study/review-queue`로 근사 가능.

### B5. 오답노트 피드 🟠
- `fetchCards(subject, examId, untagged)` 연결(봉투 수정). CardRow를 `Card`에서 매핑(`title`=word/latex, 태그·`exams:[{id,title}]`). 졸업/상태 필터는 **클라**(명세: 졸업 숨김은 클라). "+시험" → `POST /api/cards/{id}/exams { examIds }`, 해제 `DELETE /api/cards/{id}/exams/{examId}`. 삭제 `DELETE /api/cards/{id}`(soft).
- 파일: `pages/wrong-note`·`study-pick`, `widgets/card-row`.

### B6. 리포트 🟠
- **명세**: `GET /api/reports/summary?period=YYYY-MM` → `{ period, basic{ newCards, studyCount, accuracy{ word, problem } }, full{ reasonBreakdown, weakConcepts[], growth{ memorizedDelta, message }, graduatedThisMonth }, grass:[{ date, count }] }`(무료는 `full: null`).
- **매핑**: `grass[].count` → 잔디 레벨 색(클라 계산). `basic.newCards`·`accuracy.word` → 상단 스탯. `full.weakConcepts`(평평한 string[]) → 약한 개념.
- **명세에 없음(→§C, 목업 유지)**: 과목별 학습 비중 도넛(수학/영어), 오늘/이번 달 토글, 일일 과목별 막대(eng/math), 월 prev/next, weakConcepts 과목별+count.
- 파일: `pages/report`.

### B7. 홈 🟠
- GameStatus ← `GET /api/exp/summary` `{ level, exp, nextLevelExp, todayEarned, dailyCap, streakDays }`(`nextExp`→`nextLevelExp`). 마운트 시 `POST /api/exp/attend`(멱등). DdayCard ← `GET /api/exams`(dday) + `GET /api/study/review-queue`(dueCount→todayDue). 최근 카드 ← `/api/cards`.
- **명세에 없음(→§C)**: questLabel(일일 퀘스트), memoryRate.
- 파일: `pages/home`, `widgets/game-status`·`dday-card`.

### B8. 시험 🟢
- **필드명 정합**: `name`→`title`, `id` 문자열→숫자, `detail` 문자열 분해. 목록 `GET /api/exams`, 등록 `POST /api/exams { title, subject, examDate }`(→ 복습 재배치 `rescheduledCount`), 수정 `PATCH /api/exams/{id}`, 삭제 `DELETE /api/exams/{id}`. 등록 넛지 `POST /api/exams/{id}/tag-recent { sinceDays }`. 시험 대비 복습 `GET /api/exams/{id}/today`.
- 파일: `pages/exam`·`exam-select`.

### B9. 캡처/분석 — 가짜 지연 ↔ 비동기 🟠
- **현재 FE**: 2.8초 가짜 지연 → 결과. **명세**: `POST /api/cards/analyze { type, cropImages[≤10]/cropImage, fullImage, examId? }` → **202** `{ jobId, status:PENDING }` → 폴링 `GET /api/cards/analyze/{jobId}`(COMPLETED 시 cards) 또는 SSE `GET /api/cards/analyze/{jobId}/events`. 한도 `GET /api/me`(dailyUsed/dailyLimit) → 초과 시 LimitPage. 실패 시 quota 환불.
- 파일: `pages/capture`, `features/capture/*`, `pages/limit`.

### B10. 인증 / 마이 / 프리미엄 🟠
- login/register 연결(A2). My ← `GET /api/me` `{ email, nickname, premium, dailyUsed, dailyLimit, aiMockMode }`(premium은 계산값). 프리미엄 `POST /api/premium/activate`, 해지 `DELETE /api/premium`(만료일까지 유효). paywall/pay는 모의 활성화 — 실 PG는 `/api/billing/checkout`·`confirm`·`webhook`·`subscription` 후속.
- 파일: `pages/my`·`paywall`·`pay`·`pay-done`·`limit`·`withdraw`.

### B11. 내보내기 🟢
- **현재 FE**: `ExportType 'MATH'|'WORD'` + `Range 'DONT'|'CONFUSED'|'ALL'`. **명세**: `POST /api/export/note { type: PDF_NOTE|PDF_WORDTEST|JPG_CARD, cardIds[] }` → `{ downloadUrl, expiresIn }`, 다운로드 `GET /api/export/{id}/download`. range는 cardIds 클라 선택으로 매핑, type 재매핑(WORD→PDF_WORDTEST, MATH→PDF_NOTE).
- 파일: `pages/export`·`export-done`.

### B12. 원문 보관함 🟢
- **명세**: `GET /api/cards/archive?month=YYYY-MM` → `{ days:[{ date, items:[{ cardId, type, subject, imageUrl }] }] }`. FE의 문자열 items(WORD/PROBLEM)를 실제 항목+`imageUrl` 썸네일로 매핑.
- 파일: `pages/archive`.

---

## C. 대응 엔드포인트 없음 → **백엔드 요청 목록** (당분간 목업 유지)

| 기능 | 화면 | 비고 |
|---|---|---|
| 검색 텍스트 질의 | `pages/search` | `/api/cards`에 `q` 파라미터 없음. 클라 필터로 임시 대응 가능하나 서버 검색 권장 |
| 알림 피드 | `pages/notifications` | 엔드포인트 없음 |
| 과목별 학습 비중(수학/영어 도넛) | `pages/report` | 최근 QA 반영분. `reports/summary`에 과목 분해 없음 |
| 오늘/이번 달 토글, 일일 과목별 막대(eng/math) | `pages/report` | 일 단위·과목 분해 시계열 없음 |
| 월 prev/next 선택 | `pages/report` | `period`로 조회 가능하나 잔디 외 월별 비교 데이터 필요 |
| weakConcepts 과목별 + 오답 횟수(count) | `pages/report` | 현재 평평한 string[]만 제공 |
| 일일 퀘스트(questLabel) | `pages/home` | exp 응답에 없음 |
| memoryRate(기억률) | 홈 D-day / 학습 설정 | 카드별 recallProb는 v2. 집계 기억률 필드 없음 |
| "잊을 확률 78%"(recallProb) | `pages/flashcard` | v2 FSRS 전환 시 큐에 `recallProb` 추가 예정 |
| AI 추천 통계(기억률/개수/예상시간) | StudySetupSheet | 추천 요약 엔드포인트 없음 |
| exp v2 필드 | study 응답·`/api/me` | `study` 응답 `exp{earned,total,levelUp}`, `/api/me` level·exp는 🔵 v2 |

---

## D. 권장 진행 순서 (이후 이슈/PR 분할)

- **Phase 0 — 기반**: A1 봉투 언랩 + A2 인증 회전 + login/register + A3 react-query 표준 + cardApi 수정. (선행 필수)
- **Phase 1 — 조회 플로우**: B5 오답노트 피드, B7 홈(exp/exams/review-queue/attend), B6 리포트(summary 매핑 + §C 갭 표시), B10 마이(/api/me), B12 보관함.
- **Phase 2 — 학습 기록 플로우**: B3 플래시카드(큐+study), B1 빈칸(주관식+서버판정 재작성), B2 수학(큐/단계/판정/기록).
- **Phase 3 — 액션**: B8 시험 CRUD+태깅, B9 캡처 비동기(analyze+폴링/SSE+한도), B11 내보내기 리맵, B10 프리미엄 활성/해지.
- **Phase 4 — 정리**: §C 백엔드 요청 목록을 백엔드 팀에 전달.

각 항목은 기존 QA 워크플로우와 동일하게 **이슈 → 연결 브랜치 → 파일 단위 커밋 → PR**로 진행한다.

---

## E. 엔드포인트 ↔ 화면 매핑 체크리스트 (45개)

| API-ID | 메서드 | 엔드포인트 | 연결 화면/기능 | Phase |
|---|---|---|---|---|
| 1 | POST | /api/auth/register | 회원가입 | 0 |
| 2 | POST | /api/auth/login | 로그인 | 0 |
| 37 | POST | /api/auth/refresh | 토큰 회전(client 인터셉터) | 0 |
| 38 | POST | /api/auth/logout | 로그아웃 | 0 |
| 3 | GET | /api/me | 마이·한도(캡처) | 0/1 |
| 4 | PATCH | /api/me/settings | (폐기 v1.9 — 미사용) | — |
| 5 | POST | /api/premium/activate | 프리미엄 활성(모의) | 3 |
| 28 | DELETE | /api/premium | 프리미엄 해지(모의) | 3 |
| 6 | POST | /api/cards/analyze | 캡처 분석 접수(202) | 3 |
| 39 | GET | /api/cards/analyze/{jobId} | 분석 폴링 | 3 |
| 40 | GET | /api/cards/analyze/{jobId}/events | 분석 SSE | 3 |
| 7 | GET | /api/cards | 오답노트/홈 최근/검색 | 1 |
| 8 | GET | /api/cards/{id} | 카드 상세 | 1/2 |
| 9 | DELETE | /api/cards/{id} | 카드 삭제 | 1 |
| 10 | GET | /images/{file} | 이미지 서빙 | 1 |
| 36 | GET | /api/cards/archive | 원문 보관함 | 1 |
| 43 | POST | /api/cards/{id}/exams | 카드 시험 태깅 | 3 |
| 44 | DELETE | /api/cards/{id}/exams/{examId} | 태깅 해제 | 3 |
| 11 | POST | /api/cards/{id}/study | 학습 기록(공통) | 2 |
| 12 | GET | /api/study/flashcards | 플래시카드 큐 | 2 |
| 13 | GET | /api/study/review-queue | 오늘 복습 큐(홈 배너) | 1 |
| 14 | GET | /api/study/cloze | 빈칸 문항 | 2 |
| 15 | POST | /api/study/cloze/{id}/answer | 빈칸 판정 | 2 |
| 16 | POST | /api/study/cloze/{id}/regenerate | AI 예문 재생성 | 2 |
| 29 | GET | /api/study/math | 수학 복습 큐 | 2 |
| 30 | POST | /api/study/math/{cardId}/steps/{no} | 사고 단계 공개 | 2 |
| 31 | POST | /api/study/math/{cardId}/answer | 수학 판정 | 2 |
| 41 | POST | /api/study/math/{cardId}/solutions | 다른 풀이 생성 | 2 |
| 17 | GET | /api/reports/summary | 리포트 | 1 |
| 18 | POST | /api/exp/attend | 홈 출석 | 1 |
| 19 | GET | /api/exp/summary | 홈 게임 상태 | 1 |
| 20 | GET | /api/exp/ranking | 랭킹(화면 없음 — 후속) | — |
| 32 | GET | /api/exams | 시험 목록·홈 D-day | 1 |
| 33 | POST | /api/exams | 시험 등록 | 3 |
| 34 | PATCH | /api/exams/{id} | 시험 수정 | 3 |
| 35 | DELETE | /api/exams/{id} | 시험 삭제 | 3 |
| 42 | GET | /api/exams/{id}/today | 시험 대비 복습 | 3 |
| 45 | POST | /api/exams/{id}/tag-recent | 최근 카드 일괄 태깅 | 3 |
| 25 | POST | /api/export/note | 내보내기 생성 | 3 |
| 26 | GET | /api/export/{id}/download | 내보내기 다운로드 | 3 |
| 21 | POST | /api/billing/checkout | 결제창(실 PG 후속) | 후속 |
| 22 | POST | /api/billing/confirm | 결제 승인(후속) | 후속 |
| 23 | DELETE | /api/billing/subscription | 구독 해지(후속) | 후속 |
| 24 | POST | /api/billing/webhook | 정기결제 웹훅(서버) | — |
| 27 | GET | /api/health | 헬스체크/AI 모의 모드 | 0 |

---

## F. 검증 방법 (이후 실행 단계 참고)
- 기반 공사 실행 시: `tsc·oxlint·vite build` 통과 + 백엔드 `:8000` 프록시로 dev 구동.
- 네트워크 탭에서 봉투 언랩(`data` 사용)·401→refresh 재발급·재시도 확인.
- 화면별 Playwright 스모크(로딩/에러/빈 상태, 학습 기록 후 상태 전이).
- 각 PR은 기능 단위 + 스크린샷/네트워크 근거 첨부.
