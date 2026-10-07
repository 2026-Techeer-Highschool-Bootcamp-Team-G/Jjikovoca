촬영 셔터 직후 0.6초 동안 덮이는 보상 이펙트. 행동 → 보상 간격을 0에 가깝게 유지하는 장치다.

```jsx
<CaptureFlash active={shot} />
```

- 부모는 `position: relative` 여야 한다(앱에서는 전체 화면 `fixed`).
- 보상 표현은 옐로우 고정. 파랑으로 바꾸지 않는다.
