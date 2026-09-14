복습에서 누른 알/헷/몰 평가의 누적 횟수를 한 줄로 보여준다 (FR-18 취약 단어 파악).

```jsx
<RatingCounts know={4} confused={2} dontKnow={7} size="sm" />
```

- 순서는 항상 알 → 헷 → 몰 로 고정이며 색은 `--color-rating-*` 토큰을 쓴다.
- 단어장 정렬("몰라요 빈도순")과 함께 쓰이는 지표다. 여기서 숫자를 가공하지 말고 서버 값(knowCount/confusedCount/dontKnowCount)을 그대로 넘긴다.
