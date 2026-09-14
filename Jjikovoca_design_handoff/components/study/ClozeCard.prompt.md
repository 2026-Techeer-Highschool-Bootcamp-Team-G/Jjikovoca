예문 빈칸 채우기 퀴즈 카드 — 입력 → 서버 판정(정답/오답 뜻 공개) 두 상태를 가진다.

```jsx
<ClozeCard sentence="A change of plan seemed ___." translation="계획 변경은 피할 수 없어 보였다." value={answer} onChange={setAnswer} onSubmit={submit} />
<ClozeCard sentence="..." judged correct={false} value="inevitible" word="inevitable" meaning="피할 수 없는" />
```

- 판정 화면 아래에는 항상 `GradeButtons`(알/헷/몰)를 붙인다 — 평가가 study_log 로 쌓여 FR-18 누적 횟수가 된다.
- 정답 공개는 형광펜 하이라이트(`--gradient-highlighter`)로, 빨강/초록은 테두리와 라벨에만 쓴다.
