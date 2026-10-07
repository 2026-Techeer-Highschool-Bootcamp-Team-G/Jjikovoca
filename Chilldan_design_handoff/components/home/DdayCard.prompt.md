홈의 첫 카드 — "언제까지, 얼마나 남았나"를 한 줄로 알린다.

```jsx
<DdayCard title="중간고사" dday={12} memoryRate={68} todayDue={14} onClick={goExam} />
```

- 시험이 등록되지 않았으면 이 카드 대신 점선 테두리 유도 버튼("시험을 등록하고 D-day·복습 일정을 받아보세요")을 쓴다. 가짜 D-day 를 만들지 않는다.
