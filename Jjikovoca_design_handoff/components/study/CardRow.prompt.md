단어장 목록의 기본 단위. 카드 사이 간격은 8px, 좌우 20px.

```jsx
<CardRow row={{ id: 1, title: 'inevitable', pronunciation: '[ɪnˈevɪtəbl]', subtitle: '피할 수 없는', tags: [{label:'형용사',tone:'grey'}], exams: ['중간고사'], showSpeaker: true }} expandable />
```

- `speaking` 은 TTS 재생 중에만. 행이 `jjik-speak-pulse` 로 숨쉬고 단어에 형광펜이 칠해진다.
- 시험이 지정되지 않은 카드는 `untagged` 로 "+ 시험" 칩을 노출해 태깅을 유도한다.
