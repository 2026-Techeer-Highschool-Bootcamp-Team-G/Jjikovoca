단어 카드에 붙는 다중 태그 한 개를 렌더한다 — 시험 태그는 강조, 사용자 태그는 회색 칩.

```jsx
<TagChip kind="exam" label="중간고사" dday={7} />
<TagChip label="#수능특강" />
<TagChip kind="more" label="+2" />
```

- `kind="exam"` 은 캡슐 + 700 굵기 + 📅 로 항상 일반 태그보다 먼저 배치한다.
- 태그 개수 제한은 없다(FR-04). 목록에서는 2개까지만 보이고 나머지는 `kind="more"` 로 접는다 — `TagList` 가 그 규칙을 구현한다.
- `onRemove` 는 태그 편집 시트에서만 쓴다.
