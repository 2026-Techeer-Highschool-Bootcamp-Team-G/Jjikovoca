화면 상단 탭 — 탭 개수만큼 균등 분할하고, 인디케이터 한 줄이 선택 위치로 미끄러진다(0.28s).

```jsx
<Tabs tabs={[{key:'word',label:'단어'},{key:'problem',label:'문제'}]} value={tab} onChange={setTab} />
```

- 3~4개까지. 그보다 많으면 Chip 가로 스크롤을 쓴다.
