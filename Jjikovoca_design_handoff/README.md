# Handoff: 찍어보카 v3.2 요구사항 반영 (다중 태그 · 복습 진입 · 리포트 · 테마 · 구독)

## Overview

찍어보카(Jjikovoca) 모바일 앱의 프론트엔드를 요구사항 명세서 **v3.2 / v3.3** 기준으로 맞추기 위한 디자인 핸드오프다. 기존 `web/` 코드(v2.x 시점)와 현재 요구사항 사이에 생긴 차이 — 다중 태그 시스템, 활성 시험 자동 태깅, 알/헷/몰 누적 표시, 복습 진입 2단 구조, 예문 빈칸 판정, 학습 리포트, 다크 테마, Plus/Pro 구독, 오프라인 방어 — 를 화면과 컴포넌트 단위로 정의한다.

대상 코드베이스: `https://github.com/2026-Techeer-Highschool-Bootcamp-Team-G/Jjikovoca` (`web/`, Vite + React + FSD). 배포는 Capacitor 로 App Store / Google Play.

## About the Design Files

이 번들의 파일은 **HTML/JSX 로 만든 디자인 레퍼런스**다. 프로덕션 코드가 아니다.

- `components/**/*.jsx` — 브랜드 프리미티브의 **시각 명세**. 스타일 값(패딩·radius·색·폰트 크기·전환 시간)을 읽어 대상 코드베이스의 컴포넌트로 옮긴다. 파일을 그대로 복사해 쓰는 것을 전제로 만들지 않았다(상태 관리·i18n·접근성·테스트가 빠져 있다).
- `ui_kits/jjikovoca-app/*.jsx` — 화면 조립 방식과 플로우를 보여주는 클릭 스루. 데이터는 `data.js` 의 가짜 값이다. 실제 구현은 기존 FSD 구조(`pages/` `widgets/` `features/` `entities/` `shared/`)와 API 레이어를 따른다.
- `tokens/*.css` — **이건 그대로 이식해도 된다.** 값이 원본 `web/src/shared/styles/tokens.css` 실측에서 출발했고, 새로 추가된 것은 다크 스코프·rating·grass·safe-area 토큰이다.

즉 할 일은 "HTML 을 붙이는 것"이 아니라, **이 디자인을 기존 React 환경의 패턴으로 재현하는 것**이다.

## Fidelity

**High-fidelity.** 색·타이포·간격·radius·모션 값이 모두 확정값이며 CSS 변수로 표현돼 있다. 픽셀 단위로 재현할 것 — 4/8px 그리드로 반올림하지 말고 명시된 값을 그대로 쓴다(예: 태그 칩 radius 5px, 카드 radius 12/14/20px, 선택 테두리 1.5px).

예외: `ReportScreen` 은 원본 코드에 화면이 없어 FR-09 가 명시한 지표만으로 새로 구성했다. 레이아웃은 hifi 이지만 **기획 확인이 필요한 유일한 화면**이다.

---

## Design Tokens

전량은 `tokens/` 를 보고, 새로 추가·변경된 것만 정리한다.

### 다크 테마 (FR-17)

`[data-theme="dark"]` 스코프에서 **시맨틱 토큰만** 재정의한다. 프리미티브(`--grey-*`, `--blue-*`)는 건드리지 않는다. 컴포넌트가 시맨틱 변수만 참조하므로 테마 분기 코드가 필요 없다.

| 토큰 | 라이트 | 다크 |
| --- | --- | --- |
| `--color-bg-secondary` (페이지) | `#f2f4f6` | `#121317` |
| `--color-bg-primary` (표면/카드) | `#ffffff` | `#1c1d23` |
| `--color-bg-elevated` (모달·플래시카드) | `#ffffff` | `#23252c` |
| `--color-border-default` | `#e5e8eb` | `#2f323a` |
| `--color-text-primary` | `#191f28` | `#f2f4f6` |
| `--color-text-secondary` | `#6b7684` | `#a4acb9` |
| `--color-text-tertiary` | `#b0b8c1` | `#6b7684` |
| `--color-brand-primary` | `#3182f6` | `#4593fc` |
| `--color-brand-weak` | `#e8f3ff` | `#17304d` |
| `--color-accent` (형광펜) | `#ffd84d` | `#ffd84d` (동일) |
| `--color-danger-primary` | `#f04452` | `#ff6b74` |
| `--color-success-primary` | `#05c072` | `#2ed48b` |

구현: `document.documentElement.dataset.theme = 'light' | 'dark'`. `user_setting.theme_mode` 가 `system` 이면 `window.matchMedia('(prefers-color-scheme: dark)')` 를 구독해 **실시간** 전환한다(FR-17 인수 조건). 저장은 로컬 + 서버 동기화.

### 알/헷/몰 (FR-18)

```
--color-rating-know:#3182f6        --color-rating-know-weak:#e8f3ff
--color-rating-confused:#e07a1e    --color-rating-confused-weak:#fff0dd
--color-rating-dont-know:#f04452   --color-rating-dont-know-weak:#fee9ea
```

순서는 항상 알 → 헷 → 몰. 다크에서는 각각 `#61a5ff` / `#ffa94d` / `#ff707a`, weak 는 `#17304d` / `#3a2812` / `#3a1f22`.

### 학습 잔디 (FR-14)

`--color-grass-0…4`: `#f2f4f6` → `#c6e0ff` → `#8ec1fb` → `#4593fc` → `#2272eb`. **초록이 아니라 브랜드 파랑 4단.**

### Safe-area (Capacitor)

```
--safe-top/bottom/left/right: env(safe-area-inset-*, 0px)
--layout-header-offset: calc(56px + var(--safe-top))
--layout-bottom-nav-offset: calc(82px + var(--safe-bottom))
--layout-cta-bottom: calc(108px + var(--safe-bottom))
```

### 기존 값 (변경 없음)

간격 4·8·12·16·20·24·32 / 화면 좌우 여백 20px / 앱 최대 폭 480px / radius: 목록 카드 12, 정보 카드 14, 플래시카드·시트 20, 칩 999, 태그 5 / 그림자 4종(card `0 2px 8px rgba(0,0,0,.08)`, flashcard `0 8px 24px rgba(0,0,0,.12)`, modal `0 8px 24px rgba(0,0,0,.16)`, fab `0 5px 12px rgba(14,61,140,.35)`) / 폰트 `-apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard Variable', system-ui`, 굵기 400/500/700, 크기 10·11·12·13·15·16·17·22·28 / 이징 standard `cubic-bezier(.4,0,.2,1)`, flip `cubic-bezier(.2,.8,.3,1)`, spring `cubic-bezier(.2,.9,.3,1.2)`.

---

## New / Changed Components

각 컴포넌트의 정확한 props 는 `components/<group>/<Name>.d.ts`, 용도와 예시는 `<Name>.prompt.md`, 시각 명세는 `<Name>.jsx` 에 있다. 아래는 구현 시 놓치기 쉬운 규칙만 적는다.

### TagChip / TagList / TagFilterTabs — FR-04 다중 태그

- 시험 태그: 캡슐(radius 999), `brand-weak` 배경 + `brand-primary` 글자, weight 700, 라벨 `📅 {시험명} D-{n}`.
- 일반 태그: radius **5px**, `bg-secondary` 배경 + `text-secondary` 글자, weight 500, 라벨에 `#` 포함.
- 정렬은 컴포넌트가 강제한다: **시험 태그 → 일반 태그 → `+N`**. 호출 측에서 정렬하지 않는다.
- 목록에서는 일반 태그 2개까지, 나머지는 `+N` 칩(투명 배경 + 1px 테두리). 단어 상세는 전부 펼친다.
- 태그 개수 제한 없음. 편집은 `onRemove` 로 × 를 붙인 칩 + "+ 태그 추가" 버튼(바텀시트).
- 필터 탭은 가로 스크롤 한 줄, 라벨 뒤에 단어 수, 우측 끝에 점선 "태그 관리" 버튼.
- **삭제됨**: 기존 상태 칩 `졸업완료 / 복습대기 / 약점유형` (FSRS 제거와 함께 사라짐). 이 태그 탭이 그 자리를 대체한다.

### RatingCounts — FR-18 알/헷/몰 누적

- 카드 행의 태그 줄 **오른쪽 끝**(`margin-left:auto`)에 붙는다. 칩 3개: `알 4` `헷 2` `몰 1`, radius 999, weight 700, 숫자는 `tabular-nums`.
- 서버 값 `knowCount / confusedCount / dontKnowCount` 를 그대로 넘긴다. 클라이언트에서 합산·가공하지 않는다.
- 단어장 기본 정렬은 **"몰라요 빈도순"** (`dontKnow - know` 내림차순), 토글로 "최근 추가순".

### StudyOptionCard — FR-10 · FR-12 복습 진입

- 높이 최소 72px, 좌측 40px 아이콘 뱃지(radius 12) + 제목 15/700 + 설명 12/1.5 + 우측 수치 12/700.
- 선택 시 `brand-weak` 배경 + 1.5px `brand-primary` 테두리. 프레스 시 `scale(0.98)` 120ms.
- **2단 구조**: 1단 방식 3장(태그로 복습 / 직접 골라 복습 / 오답률 높은 단어) → 2단 유형 2장(플래시카드 / 예문 빈칸). 예전 3계층 난이도 선택은 폐기.
- 방식별 부가 UI: 태그 → `TagFilterTabs`, 직접 선택 → `CardRow selectable` 목록(우상단 체크 표식), 오답률 → 대상 개수만 표시.

### ClozeCard — FR-06 예문 빈칸

- 예문의 정답 단어를 `___` 로 치환. 빈칸은 `min-width:96px` + 2px 하단 테두리, 색은 입력 중 brand / 정답 green / 오답 red.
- 두 상태: **입력**(48px 입력창 + 단계 힌트 "첫 글자 i · 10글자") → **판정**(정답 여부 라벨 + 내가 쓴 답 + 뜻 형광펜 공개, 배경 `success-weak`/`danger-weak`).
- 판정 화면 아래에는 **반드시** `GradeButtons`(몰라요/헷갈려요/알아요)를 붙인다. 이 평가가 `study_log` 로 쌓여 FR-18 누적 횟수가 된다.

### DonutChart / MiniBarChart / StreakGrid — FR-09 · FR-14

- 도넛은 `conic-gradient` + 중앙 구멍(`inset: thickness`, 배경 `bg-primary`). 중앙에 큰 숫자 24/700 + 라벨 11. 우측에 범례(색 8×8 radius 2 + 라벨 + 퍼센트).
- **방사형(레이더) 차트는 v1.9 에서 제거.** 비중 표현은 항상 도넛.
- 막대는 7칸(요일)까지, 축·격자 없음, 최댓값만 `brand-primary` 나머지 `brand-weak`, 높이 전환 280ms.
- 잔디는 0~4 다섯 단계, 셀 12px radius 3, gap 3, 13주 기본. 상단에 `🔥 연속 N일 학습 중`.

### PlanCard — FR-19 구독

- Free(하루 3회) / **Plus ₩3,900 · 20회** / **Pro ₩6,900 · 40회**. 한도 문구는 형광펜 하이라이트.
- 추천 플랜은 1.5px brand 테두리 + 좌상단 "추천" 캡슐. 이용 중인 플랜은 회색 비활성 CTA.
- 결제 화면에는 **갱신 주기 · 해지 방법 · 이용약관 · 개인정보처리방침**을 캡션으로 함께 노출(스토어 심사 요건).
- 결제는 네이티브 IAP(RevenueCat 권장). 외부 PG·아웃링크 버튼을 만들면 반려된다.

### SegmentedControl — FR-17

- 컨테이너 `bg-secondary` radius md + padding 3, 선택 칸만 `bg-primary` + `--shadow-card`, 글자 700. 높이 40(sm 32).
- 용례: 테마 3지(라이트/다크/시스템 자동), 활성 시험 ON/OFF.

### OfflineNotice — NFR 5-1

- `variant="screen"`: 56px 원형 아이콘 + 제목 17/700 + 설명 13/1.6 + 44px 재시도 버튼.
- `variant="banner"`: `danger-weak` 배경 한 줄 + 밑줄 "다시 시도".
- 데이터가 비어서 보여주는 건 `Placeholder`, 통신 실패는 이 컴포넌트. **흰 화면은 절대 금지.**

### 수정된 기존 컴포넌트

- **FlashCard** — 앞면은 단어 + AI 연상 이미지(+ 태그·발음)만. 뜻과 예문은 **뒷면에만**. 사용자가 찍은 원문 크롭은 어느 면에도 노출하지 않는다(이미지 단기 보관 정합).
- **CardRow** — 태그 렌더링을 `TagList` 로 교체(시험 우선 · +N), `row.ratings` 가 있으면 `RatingCounts` 표시, `onMoreTags` 콜백 추가. `row.exams` 는 문자열 또는 `{label, dday}`.
- **WordCard** — 태그를 `TagList` 로 교체.

---

## Screens / Views

각 화면의 조립은 `ui_kits/jjikovoca-app/` 의 동명 JSX 를 정본으로 본다.

### 1. 단어장 (`VocabScreen.jsx` → `pages/wrong-note`)

- **목적**: 캡처·분석된 단어를 태그별로 모아보고 복습으로 진입.
- **레이아웃**(위→아래, 좌우 여백 20px): 제목 "단어장" 22/700 → `SearchBar`("단어 · 뜻 · 태그 검색") → `TagFilterTabs`(가로 스크롤) → 발음 로케일 토글(🇺🇸/🇬🇧) + 정렬 토글("몰라요 빈도순 ▾") → `CardRow` 목록(gap 8) → 하단 고정 `Button block size="lg"` "학습하기"(bottom `--layout-cta-bottom`) → 하단 탭.
- **상태**: `activeTag`, `sort('WRONG'|'RECENT')`, `voice('US'|'GB')`, `speakingId`, `sheet`, `tagSheet`.
- **인터랙션**: 태그 탭 → 해당 태그 단어만 필터 / 카드 탭 → 예문 펼침 / 스피커 → 재생 중 행 글로우(1.4s) / `+N` 또는 "+ 시험" → 태그 편집 시트 / "학습하기" → 복습 방식 선택.
- **빈 상태**: "이 태그에 담긴 단어가 아직 없어요 — 시험지를 촬영해보세요".

### 2. 학습 (`StudyScreen.jsx` → `pages/study-pick`, `pages/flashcard`, `pages/cloze`)

- **플로우**: `mode`(방식 3장) → `type`(유형 2장) → `loading`(1.1s, `StudyLoading`) → `quiz` → `done`.
- **큐 생성 규칙**: 태그 → 해당 태그 단어 / 직접 선택 → 체크한 id / 오답률 → `dontKnow > know` 인 단어를 `dontKnow` 내림차순.
- **퀴즈 화면**: 상단 `NavigationBar` 제목 "3 / 12" + 4px 진행 바(width 전환 300ms) → 카드 → 하단 판정. 플래시카드는 바로 `GradeButtons`, 빈칸은 "정답 확인" → 판정 → `GradeButtons`.
- **완료**: `SuccessGraphic` + "N개 복습 완료!" + "연속 16일 · +40XP 를 받았어요" + CTA 2개(단어장으로 / 다른 방식으로 더 하기).
- **FSRS 제거**: "다음 복습 일정", 간격 계산, 졸업 개념을 표시하지 않는다. 평가는 `study_log` 기록용이다.

### 3. 리포트 (`ReportScreen.jsx` → `pages/report`) — 신설

- 헤더: "학습 리포트" 22/700 + "9월 · 새로 추가한 단어 38개 · 학습 214분" 13.
- 패널 3장(흰 카드 radius 14, padding 16, 제목 13/700): 단어 정답률(`DonutChart` 78% + 알헷몰 비중) / 주간 학습 시간 분포(`MiniBarChart`) / 학습 잔디(`StreakGrid`).
- `ListHeader` "나의 약한 단어 Top 3" + link "단어장에서 보기" → `CardRow` 3행.
- FR-09 가 명시한 지표만 넣었다. 지표를 임의로 늘리지 말 것.

### 4. 마이 (`MyScreen.jsx` → `pages/my`)

- 프로필 카드 → `GameStatusCard`(레벨·XP·연속일·일일 퀘스트) → 학습 잔디 패널 → **활성 시험 카드**(시험 태그 + 설명 + 자동 태깅 ON/OFF 세그먼트 + "시험 등록 ›") → **화면 테마 카드**(세그먼트 3지) → 구독 카드(`--gradient-premium`, "Plus 이용 중 / 월 ₩3,900 · 다음 결제 10월 4일 · 사진 분석 12/20회", "플랜 변경 ›" → `PlanCard` 3장 시트).
- 설정 목록: 학습(📅 시험 일정 / 🏷️ 태그 관리 / 🔔 알림), 계정(🔒 개인정보 처리방침 / 📄 이용약관 / 🚪 로그아웃), 하단 "회원 탈퇴 (데이터 즉시 파기)".
- **삭제됨**: "📁 원문 보관함" (이미지 단기 보관 정책).

### 5. 셸 (`App.jsx`)

- `BottomNav` 4탭(홈·단어장·리포트·마이) + 중앙 56px 로고 FAB(16px 돌출, 촬영 진입). 탭 높이 82px + safe-bottom.
- 테마는 루트의 `data-theme`. 오프라인 상태에서는 화면 본문을 `OfflineNotice` 로 대체하고 하단 탭을 숨긴다.

---

## Interactions & Behavior

- **프레스 피드백**(모바일이라 hover 없음): 카드 행·선택 카드 `scale(0.98)` 120ms, 비활성 `opacity .4`, 선택 전환 160ms.
- **전환**: 카드 3D 플립 500ms flip 이징 / 시트 상승 250ms / 오버레이 페이드 200ms / 탭 인디케이터 280ms standard / 성공 팝 600ms spring.
- **캡처**: 스캔 라인 → 노란 엣지 글로우 → 화이트 플래시 120ms → 스파클 → XP 칩 상승(`CaptureFlash`). 키프레임 접두사 `jjik-*` 유지.
- **로딩**: AI 분석은 `202 + jobId` 비동기 접수 후 SSE 로 진행 표시. 즉시 크롭 애니메이션 + 대기열 스피너로 체감 지연을 가린다.
- **에러**: 통신 실패 `OfflineNotice`, 빈 데이터 `Placeholder`, 파괴적 확인 `Dialog`.
- **반응형**: 단일 컬럼 390~480px. 480px 초과 시 중앙 정렬 + 좌우 여백 유지. 데스크톱 전용 레이아웃 없음.

## State Management

화면 로컬 상태는 위 각 화면 절에 적었다. 서버 상태에서 이번 변경으로 새로 필요한 것:

- `tag`, `card_tag` 다대다 — 태그 CRUD, 태그별 카드 조회, 태그 단어 수.
- `exam`, `exam_card`, `user_setting.active_exam_id` — 활성 시험 + 촬영 시 자동 태깅.
- `study_log` 집계 `knowCount / confusedCount / dontKnowCount` — 단어장 조회 성능을 위해 단어 엔티티에 캐싱/역정규화 검토(FR-18 비고).
- `user_setting.theme_mode` — `light | dark | system`.
- 구독 상태 + 일일 AI 쿼터(Redis 원자적 차감, 20/40회).
- 리포트 집계 — 새 단어 수, 정답률, 주간 학습 시간 분포, 알헷몰 비중, 일별 학습 강도(잔디), 약한 단어 Top3.

## Platform Constraints (Capacitor)

`brand-guide.md` 의 "PLATFORM CONSTRAINTS" 절이 정본. 요지:

- Safe-area 토큰 사용, `100vh` 고정 금지.
- 화면 좌측 가장자리 ~20px 에 가로 스와이프/드래그 인터랙션 금지(iOS 뒤로 가기 제스처).
- hover 의존 상태·아웃링크·주소창 느낌 헤더 금지(웹 래핑 반려 방지).
- 흰 화면 금지 — 오프라인/로딩/빈 상태 UI 필수.
- 결제는 네이티브 IAP 만. 소셜 로그인 추가 시 'Apple로 로그인' 동일 비중.
- 계정 탈퇴는 앱 내에서 즉시 파기까지.
- 권한 요청은 맥락 안에서(촬영 버튼 탭, D-day 등록 완료 시점). 거부 시 대체 화면.
- 발음은 네이티브 TTS 플러그인, PDF 는 Filesystem + Share 시트 → 버튼 결과는 "다운로드"가 아니라 **OS 공유 시트**이며 문구도 그에 맞춘다.

## Assets

- `assets/logo.svg` — 앱 로고 마크(파란 라운드 스퀘어 + 뷰파인더 브래킷 + 노란 형광펜 스트립). `AppLogo.jsx` 와 동일.
- 아이콘은 `components/core/Icon.jsx` 의 인라인 SVG 19종(24px 그리드, 2px 스트로크, 라운드 캡)이 전부다. 원본 `web/src/shared/ui/icons.tsx` 와 같은 경로다. **Lucide·Heroicons 등 외부 세트를 섞지 않는다.**
- 세트에 없는 개념은 이모지 접두사(📅 🏷️ 🔔 🔒 📄 🚪 ⭐ ⚡ ✨ 🔥)나 유니코드(`›` `✓` `✦` `▾`)로 처리한다. 본문 문장 안에는 이모지를 넣지 않는다.
- 워드마크 이미지 파일은 없다. 로고타입이 필요하면 "찍어보카"를 20px/700 브랜드 파랑 텍스트로 적는다.
- 브랜드 사진·일러스트 자산 없음. AI 연상 이미지는 서버 생성, 없으면 이모지 폴백 — 임의의 일러스트를 그려 넣지 않는다.

## Copy & Tone

`brand-guide.md` 의 CONTENT FUNDAMENTALS 절이 정본. 요지: 해요체, 2인칭 대명사 없음, 빈 상태는 정직하게 + 다음 행동 한 개, 보상은 숫자로("+40XP", "연속 16일"), 구분자는 ` · ` 와 ` — `, 기능 이름은 한글 고정어(단어장 / 알아요·헷갈려요·몰라요 / 활성 시험 / 학습 잔디).

## Files

| 경로 | 내용 |
| --- | --- |
| `brand-guide.md` | 브랜드 가이드 정본(디자인 시스템의 readme.md) — 콘텐츠 톤, 비주얼 파운데이션, 아이코노그래피, 플랫폼 제약, 요구사항 반영표 |
| `SKILL.md` | Claude Code 에서 이 시스템을 스킬로 읽을 때의 진입점 |
| `styles.css` + `tokens/` | 전역 CSS 진입점과 토큰 8파일 (그대로 이식 가능) |
| `components/core/` | Button, Chip, Badge, TextField, SearchBar, Tabs, **SegmentedControl**, **TagChip**, **TagList**, ListHeader, ListRow, NavigationBar, Dialog, BottomSheet, Placeholder, AppLogo, Icon |
| `components/study/` | FlashCard*, **ClozeCard**, CardRow*, WordCard*, CardThumb, GradeButtons, **RatingCounts**, **StudyOptionCard** |
| `components/report/` | **DonutChart**, **MiniBarChart**, **StreakGrid** |
| `components/billing/` | **PlanCard** |
| `components/navigation/` | AppHeader, BottomNav, **TagFilterTabs** |
| `components/feedback/` | StudyLoading, SuccessGraphic, CaptureFlash, **OfflineNotice** |
| `components/home/` | DdayCard, GameStatusCard |
| `ui_kits/jjikovoca-app/` | 화면 조립 정본 — `index.html` 을 브라우저로 열면 전체 플로우가 돈다(테마·오프라인 토글 포함) |
| `guidelines/` | 파운데이션 스펙 카드(색·타입·간격·모션·다크·알헷몰) — 값 대조용 |
| `requirements/req.pdf`, `requirements/req.csv` | 요구사항 명세서 v3.2/v3.3 사본과 기능 DB |

**굵게** 표시한 것이 이번 요구사항 반영으로 새로 생긴 컴포넌트, `*` 는 수정된 기존 컴포넌트다.

## 구현 순서 제안

1. **토큰 이식** — `tokens/colors.css`(다크 스코프 포함) + `tokens/spacing.css`(safe-area)를 `web/src/shared/styles/tokens.css` 에 병합. 리스크 최저, 다크 테마의 전제.
2. **테마 스위치** — `data-theme` + `user_setting.theme_mode` + `matchMedia` 구독. 기존 화면이 시맨틱 변수만 쓰는지 점검하며 하드코딩된 hex 를 걷어낸다.
3. **태그 시스템** — `TagChip/TagList/TagFilterTabs` + `CardRow` 개편 + 단어장 피드. 기존 상태 칩 제거.
4. **알헷몰 누적** — `RatingCounts` + 정렬 + 집계 캐싱.
5. **복습 진입 2단** — `StudyOptionCard` 기반 study-pick 재작성, FSRS 잔재 제거.
6. **빈칸 판정** — `ClozeCard` + 판정 후 `GradeButtons`.
7. **리포트** — 도넛/막대/잔디. (기획 확인 후)
8. **마이 · 구독** — 활성 시험 ON/OFF, `PlanCard` + IAP.
9. **오프라인 방어** — `OfflineNotice` 를 전역 쿼리 에러 바운더리에 연결.
