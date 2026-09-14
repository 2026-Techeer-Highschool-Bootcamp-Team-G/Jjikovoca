라인 아이콘 — 색은 부모의 `color` 를 따른다(currentColor).

```jsx
<span style={{ color: 'var(--color-text-brand)' }}><Icon name="speaker" size={18} /></span>
```

- 크기 규칙: 하단 탭 24 · 헤더 20~22 · 인라인 18 · 목록 화살표 16.
- 세트에 없는 개념은 아이콘을 새로 그리지 않고 텍스트 라벨이나 이모지(📅 🔒 📁)로 대체한다 — 앱도 그렇게 한다.
