앱의 중심 오브젝트. 홈 캐러셀과 학습 게임이 같은 카드를 쓴다.

```jsx
<FlashCard card={{ word: 'inevitable', pronunciation: '[ɪnˈevɪtəbl]', meaning: '피할 수 없는', emoji: '⚖️', example: 'War seemed inevitable.', exampleTranslation: '전쟁은 피할 수 없어 보였다.', tags: [{label:'형용사',tone:'grey'},{label:'모의고사',tone:'blue'}] }} />
```

- 뜻은 반드시 형광펜(`--gradient-highlighter`) 으로 강조한다 — 브랜드의 핵심 모티프.
- 상단 이미지 영역은 이미지가 없으면 이모지 폴백. 임의의 일러스트를 그려 넣지 않는다.
- 하단에는 항상 탭 힌트 문장을 둔다.
