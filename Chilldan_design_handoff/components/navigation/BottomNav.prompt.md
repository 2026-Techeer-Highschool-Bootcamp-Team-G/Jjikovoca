앱의 상시 내비게이션. 중앙 FAB 은 앱 로고 그 자체이며 촬영(핵심 행동)으로 간다.

```jsx
<BottomNav active="vocab" onSelect={setTab} onCapture={openCapture} />
```

- 탭 라벨 10px, 아이콘 24px. 활성 탭만 brand 색 + weight 500.
- 실제 앱에서는 `position: fixed` + `env(safe-area-inset-bottom)` 여백을 더한다. 이 컴포넌트는 프레임 안에서 쓰도록 `absolute` 로 둔다.
