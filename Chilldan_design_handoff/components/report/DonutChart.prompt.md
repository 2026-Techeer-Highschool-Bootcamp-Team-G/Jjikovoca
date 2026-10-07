학습 리포트의 도넛 차트 — 정답률, 알/헷/몰 비중, 태그별 학습 비중에 쓴다 (FR-09).

```jsx
<DonutChart
  centerValue="78%"
  centerLabel="정답률"
  segments={[
    { label: '알아요', value: 62, color: 'var(--color-rating-know)' },
    { label: '헷갈려요', value: 24, color: 'var(--color-rating-confused)' },
    { label: '몰라요', value: 14, color: 'var(--color-rating-dont-know)' },
  ]}
/>
```

- 방사형(레이더) 차트는 요구사항 v1.9 에서 제거됐다 — 비중 표현은 항상 도넛으로.
- 세그먼트는 3~4개까지. 색은 `--color-rating-*` 또는 브랜드 파랑 계열을 쓰고 새 색을 만들지 않는다.
