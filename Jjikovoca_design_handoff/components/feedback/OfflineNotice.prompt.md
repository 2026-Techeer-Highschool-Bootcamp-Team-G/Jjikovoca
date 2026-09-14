오프라인·요청 실패 시 흰 화면 대신 깔아주는 안내 (NFR 5-1 네트워크 오류 방어).

```jsx
<OfflineNotice onRetry={refetch} />
<OfflineNotice variant="banner" title="오프라인이에요 — 저장은 연결 후 반영돼요" onRetry={refetch} />
```

- 데이터가 비어서 보여주는 빈 상태는 `Placeholder`, 통신이 끊겨서 못 불러온 경우는 이 컴포넌트.
- 문구는 해요체 + 다음 행동 한 개 규칙을 따른다.
