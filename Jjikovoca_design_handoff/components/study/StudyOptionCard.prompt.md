학습 진입 화면에서 복습 방식(태그 기반 / 직접 선택 / 오답률 높은 단어)과 퀴즈 유형(플래시카드 / 빈칸)을 고르는 선택 카드.

```jsx
<StudyOptionCard emoji="🏷️" title="태그로 복습" description="#수능특강 태그가 붙은 단어만 모아 풀어요" meta="42개" selected onClick={pick} />
```

- 2단 구조로 쓴다: 1단 방식 3장 → 2단 유형 2장 (FR-12 "2방식+유형"). 예전 3계층 난이도 선택은 쓰지 않는다.
- 아직 데이터가 없는 방식은 `disabled` 로 두고 빈 상태 문구를 `description` 에 적는다.
