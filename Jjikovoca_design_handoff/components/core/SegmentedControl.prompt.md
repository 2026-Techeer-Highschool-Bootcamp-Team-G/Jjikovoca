짧은 라벨 2~3개 중 하나를 고르는 세그먼트 — 화면 테마 설정이 대표 용례다.

```jsx
<SegmentedControl
  block
  value={theme}
  onChange={setTheme}
  options={[{ value: 'light', label: '라이트' }, { value: 'dark', label: '다크' }, { value: 'system', label: '시스템 자동' }]}
/>
```

- 4개 이상이면 `Tabs` 나 `Chip` 스크롤 줄을 쓴다.
- 선택된 칸만 흰 카드로 떠오른다(그림자 `--shadow-card`).
