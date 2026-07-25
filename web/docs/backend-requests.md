# 백엔드 요청 목록 (프론트 연동 중 발견)

> API 통합 Phase 1~5(`api-integration-plan.md`)를 진행하며 확인한 **명세 미제공 / 추가 필요 / 후속** 항목.
> Phase 1~4 로 **목업 폴백은 제거**되어, 각 화면은 실 API 데이터를 그대로 표시하고 데이터가 없으면 정직한 빈/제로 상태를 보인다.
> 백엔드에 대응 필드/엔드포인트가 **아예 없는** FE 전용 요소만 클라이언트 데모로 남기고 UI에 `데모` 표기 + 아래에 기록한다. 이 항목들이 백엔드에 반영되면 실데이터로 교체한다.

## 진행 상태 (Phase 1~5 요약)
- **Phase 1** — 인증 라우트 가드(미인증 → `/login`). 백엔드는 미인증 시 **403**(401 아님)
- **Phase 2** — 홈·마이·리포트·오답노트·보관함 목업 폴백 제거 → 실데이터/빈 상태. `reports/summary` 는 `?period=YYYY-MM`(WEEK/MONTH 는 400)
- **Phase 3** — 캡처 분석 카드는 서버에 저장됨(`/api/cards`). 홈 캐러셀·오답노트가 `/api/cards` 실 카드를 읽음(localStorage 데모 store 제거)
- **Phase 4** — 결제(me 무효화)·내보내기(실 downloadUrl)·직접선택(cardIds→PICK) 실연동. 클로즈/수학 데모정답·로컬판정 제거 → **서버 판정만**
- **Phase 5** — 검색은 `/api/cards` 클라 필터, 알림은 빈 상태, 리포트 FE 전용 시각화에 `데모` 표기

## 1. 대응 엔드포인트가 아예 없는 기능

| 기능 | 화면 | 필요한 것 | 현재 처리 |
|---|---|---|---|
| ~~단어·문제 텍스트 검색~~ | `GET /api/cards?q=` 서버 검색 | 텍스트 검색 | ✅ **실연동 완료**(PR #248) |
| ~~알림 피드~~ | `GET /api/notifications`·`POST .../read` | 알림 목록·읽음 | ✅ **실연동 완료**(PR #250) |
| ~~일일 퀘스트~~ | 홈 `GameStatusCard` | exp `quest{label,progress,target,completed}` | ✅ **실연동 완료**(PR #244) |
| 기억률(memoryRate) | 홈 D-day·학습 설정 | 시험 범위 집계 기억률 | 홈 D-day에서 **제거**(카드별 recallProb는 v2) |

## 2. 응답에 필드 추가가 필요한 곳

| 필드 | 엔드포인트 | 용도 | 현재 처리 |
|---|---|---|---|
| ~~`pronunciation`·`pos`·`tags[]`·`emoji`~~ | ~~`GET /api/cards`,`/study/flashcards`~~ | 발음·품사·유형태그·이모지 | ✅ **실연동 완료**(PR #240) |
| 발음 오디오(미국/영국) | — | 카드 앞면 발음 듣기 | **클라 Web Speech TTS**(데이터 아닌 기능이라 유지) |
| ~~상태 칩 카운트~~ | `GET /api/cards/counts` | 오답노트·직접선택·시험지정 배지 숫자 | ✅ **실연동 완료**(PR #248) |
| `recallProb`(잊을 확률) | `GET /api/study/flashcards` | 플래시카드 "N일 뒤 잊을 확률" | **데모**(FlashcardView 기본값) |
| AI 연상 이미지 | `GET /api/study/flashcards` | 플래시카드 상단 이미지 | **데모** |
| ~~추천 요약(기억률·개수·예상시간)~~ | `GET /api/study/recommendation` | StudySetupSheet 통계 | ✅ **실연동 완료**(PR #244) |
| ~~프리미엄 결제일·금액~~ | `GET /api/me` `premiumPlan·premiumExpiresAt·premiumAmount` | 결제 정보 | ✅ **실연동 완료**(PR #253) |
| `level`·`exp` | `GET /api/me` (v2) | exp 별도 호출 없이 표기 | 현재 `GET /api/exp/summary` 별도 호출 |
| exp 확장 `{earned,total,levelUp}` | `POST /api/cards/{id}/study` (v2) | 학습 직후 XP·레벨업 피드백 | 미사용 |

## 3. 리포트 시각화 — ✅ 실연동 완료 (PR #246)

`GET /api/reports/summary`가 `subjectBreakdown·rhythm·todayDue·grass{level,minutes}·full.weakConcepts` 전부 제공하여 실연동됨. DemoTag·데모 상수 제거:
- 과목별 학습 비중 도넛 ← `basic.subjectBreakdown[{subject,minutes,count,ratio}]`
- 학습 잔디 ← `grass[{date,count,minutes,level(0~4)}]` (level로 색)
- 약한 개념(과목 분리·오답 횟수) ← `full.weakConcepts[{concept,subject,wrongCount}]` (프리미엄)
- 일일 학습시간 막대 ← `grass[].minutes` (일별 총 분) + `rhythm.avgSessionMinutes`
- 제거: 오늘/이번달 토글·월 prev/next (과목별×요일별·월별 비교는 백엔드 미제공 → 일일막대는 단색 총 분)

## 4. 카드 모델(Card)이 thin — 카드 앞/뒷면 표현 한계

`GET /api/cards`·분석 응답 Card는 `{id,type,subject,word,contextMeaning,concept,summary,latex,boxLevel,graduated,exams}` 수준. **없음**: pronunciation, emoji, pos, 품사/유형 tags, 예문(플래시카드 큐엔 `example` 있음), 정답·사고 단계 content. 따라서:
- WORD 카드 앞면 emoji/발음/품사 = FE 데모(있으면 표시, 없으면 생략)
- PROBLEM 카드 뒷면 정답·단계 = **비노출 계약**(학습 판정/단계공개 API 로만) → 카드에선 "학습에서 확인" 유도

## 5. 확인된 계약·형식 메모 (연동 시 주의)

- 인증: 미인증 요청은 **403**(401 아님) → 클라 refresh는 401 기준. 라우트 가드로 선차단
- `GET /api/me` 에 `aiMockMode` 있음(백엔드 AI 목업 모드) — 캡처 분석은 mock 카드 반환
- `GET /api/reports/summary?period=` 는 **`YYYY-MM`** 만 허용(WEEK/MONTH → 400)
- 빈칸퀴즈 `clozeText` 빈칸은 밑줄 **여러 개**(`_____`) → 분리 시 `split(/_+/)`
- 클로즈 제출 필드 `guess`, 수학 판정 필드 `answer` (확인됨)
- 캡처 분석: `POST /api/cards/analyze`(202 `jobId`) → 폴링, COMPLETED 시 카드 + **서버 자동 저장**

## 6. 기타 매핑·후속

- **내보내기 범위→cardIds**: "몰라요만/헷갈려요만/전체" 필터를 실제 카드 선택으로 매핑(현재 전체=미지정으로 요청)
- ~~**프리미엄 해지**~~: `DELETE /api/premium` + 마이 해지 UI → ✅ **완료**(PR #253, 만료까지 유지)
- ~~**탈퇴**~~: `DELETE /api/account`(soft delete+토큰폐기) → ✅ **완료**(PR #253)

## 6-1. 배포 — 별도 오리진(VITE_API_BASE_URL) 시 백엔드 CORS 필요

프론트를 백엔드와 **다른 오리진**(예: Vercel + 원격 백엔드)에 배포하면 `VITE_API_BASE_URL`로 백엔드를 직접 호출한다. 이때 백엔드가 아래를 허용해야 브라우저가 차단하지 않는다:

- **CORS**: 프론트 오리진(`https://<vercel-app>.vercel.app` 등)에 대해 `Access-Control-Allow-Origin` 허용, `Authorization` 헤더 허용, `credentials` 정책 정합
- **`/images` 정적 리소스에도 CORS 헤더**(`<img>` cross-origin 로드) — 보관함 썸네일 등
- 프리플라이트(`OPTIONS`) 처리
- (대안) **동일 오리진 배포**(nginx가 SPA+`/api`+`/images` 한 오리진 서빙)면 CORS 불필요 — `VITE_API_BASE_URL` 비워두면 됨
- 프론트 측: `client.ts`(API)·`mediaUrl`(이미지) 모두 `VITE_API_BASE_URL`을 접두하므로 env만 설정하면 됨

## 7. 프론트 선행 작업(백엔드 아님, FE TODO)

- **CaptureEditor 크롭 추출**: 편집기가 크롭 **개수**만 반환. `analyze` 의 `cropImages` base64를 만들려면 실제 크롭 이미지 추출 필요(현재 `fullImage` best-effort)
- **레거시 화면 정리**: 4지선다 `/cloze-correct`·`/cloze-wrong`, `study-pick-3`, `capture-2~5` 등 프로토타입 중복 라우트 정리 대상
- **SSE 도입**: 캡처 분석 폴링 우선. `.../events`(SSE) 체감 개선은 후속

## 8. 참고
- 연동 상태·엔드포인트↔화면 매핑: `web/docs/api-integration-plan.md`
