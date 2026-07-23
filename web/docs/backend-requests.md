# 백엔드 요청 목록 (프론트 연동 중 발견)

> Phase 0~3 API 연동(`api-integration-plan.md`)을 진행하며 확인한 **명세 미제공 / 추가 필요 / 후속 정리** 항목을 모았다. 현재 프론트는 각 화면에서 실 API를 호출하되 미제공 항목은 **목업 폴백**으로 채워 데모를 유지하고 있다. 아래 항목이 백엔드에 반영되면 폴백을 실데이터로 교체한다.

## 1. 대응 엔드포인트가 아예 없는 기능

| 기능 | 화면 | 필요한 것 |
|---|---|---|
| 단어·문제 텍스트 검색 | `pages/search` | `/api/cards`에 `q`(검색어) 파라미터, 또는 별도 검색 엔드포인트 |
| 알림 피드 | `pages/notifications` | 알림 목록 조회 엔드포인트(아이콘·제목·시각) |
| 일일 퀘스트 | 홈 `GameStatusCard.questLabel` | exp 응답에 오늘 퀘스트/진행도 필드 |
| 기억률(memoryRate) | 홈 D-day·학습 설정 | 시험 범위 집계 기억률(현재 카드별 recallProb는 v2) |

## 2. 응답에 필드 추가가 필요한 곳

| 필드 | 엔드포인트 | 용도 |
|---|---|---|
| `pronunciation` | `GET /api/cards`, `GET /api/study/flashcards` | 오답노트 행·플래시카드 발음 표기 |
| 품사·주제 `tags`, 유형 배지(다의어/숙어) | `GET /api/cards` | 오답노트 행 태그/배지 |
| 상태 칩 카운트(전체/졸업완료/복습대기 수) | 피드 or 별도 집계 | 오답노트 상태 필터 배지 숫자(현재 하드코딩) |
| `recallProb`(잊을 확률) | `GET /api/study/flashcards` | 플래시카드 "N일 뒤 잊을 확률" (v2 FSRS) |
| 추천 요약(기억률·개수·예상시간) | 학습 설정 AI 추천 | StudySetupSheet 추천 카드 통계 |
| 프리미엄 다음 결제일 | `GET /api/me` | 마이 프리미엄 카드 "다음 결제 …" |
| `level`·`exp` | `GET /api/me` (v2) | 마이/홈에서 exp 별도 호출 없이 표기 |
| exp 확장 `{earned,total,levelUp}` | `POST /api/cards/{id}/study` (v2) | 학습 직후 획득 XP·레벨업 피드백 |

## 3. 리포트 — 명세 `reports/summary`에 없는 시각화 (QA 반영분)

`GET /api/reports/summary`는 `basic/full/grass`만 제공. 아래는 최근 QA로 넣은 UI라 현재 목업 유지:

- 과목별 학습 비중(수학/영어 도넛) — 과목별 시간·문항 분해 필요
- 오늘 / 이번 달 토글 — 일 단위 집계
- 일일 학습 시간 과목별 누적 막대(요일별 eng/math 분)
- 월 prev/next 선택 — 월별 비교 데이터(잔디 외)
- 약한 개념 과목별 분리 + 오답 횟수 — 현재 `weakConcepts`는 평평한 `string[]`
- `grass`는 `[{date,count}]` 리스트 → 4×7 그리드 매핑 규칙(레벨 임계) 합의 필요

## 4. 기타 매핑·후속

- **보관함 썸네일**: `GET /api/cards/archive`의 `imageUrl`(presigned) 실제 이미지 표시(현재 유형 스켈레톤만)
- **내보내기 범위→cardIds**: "몰라요만/헷갈려요만/전체" 필터를 실제 카드 선택으로 매핑하는 UI(현재 전체=미지정)
- **프리미엄 해지**: `DELETE /api/premium` 연동 + 해지 UI(현재 앱에 해지 화면 없음)

## 5. 프론트 선행 작업(백엔드 아님, FE TODO)

- **CaptureEditor 크롭 추출**: 현재 편집기는 크롭 **개수**(`{regions, hasBox}`)만 반환. `POST /api/cards/analyze`의 `cropImages` base64를 만들려면 편집기에서 실제 크롭 이미지를 추출해야 함(현재 `fullImage` best-effort + 폴링/폴백 스캐폴드만 연동)
- **레거시 화면 정리**: 빈칸을 주관식으로 재작성하며 4지선다 `/cloze-correct`·`/cloze-wrong`가 미사용 레거시로 잔존 → 정리 대상
- **SSE 도입**: 캡처 분석은 폴링 우선 연동. `GET /api/cards/analyze/{jobId}/events`(SSE) 체감 개선은 후속

## 6. 참고
- 연동 상태·엔드포인트↔화면 매핑: `web/docs/api-integration-plan.md`
- 각 항목은 폴백으로 데모가 유지되므로, 백엔드 반영 시 해당 화면의 폴백 분기만 실데이터로 교체하면 됨
