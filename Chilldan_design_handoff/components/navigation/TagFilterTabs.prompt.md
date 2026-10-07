단어장 피드 상단의 태그별 자동 분류 필터 (FR-04) — 가로 스크롤 탭 한 줄.

```jsx
<TagFilterTabs
  active={tag}
  onSelect={setTag}
  onManage={openTagSheet}
  items={[{ key: 'ALL', label: '전체', count: 128 }, { key: 'mid', label: '중간고사', kind: 'exam', dday: 7, count: 42 }, { key: 'sn', label: '#수능특강', count: 21 }]}
/>
```

- 순서는 컴포넌트가 강제한다: 시험 태그 → 일반 태그. '전체' 는 일반 태그로 넘기고 첫 항목에 둔다.
- 예전 상태 칩(졸업완료/복습대기/약점유형)은 FSRS 제거와 함께 사라졌다 — 이 탭이 그 자리를 대신한다.
