하단에서 올라오는 선택 시트(0.25s ease-out). 앱의 학습 설정·촬영 방법 선택이 모두 이 형태다.

```jsx
<BottomSheet open={open} onClose={close}>
  <h3 style={{margin:0,fontSize:17,fontWeight:700}}>어떻게 학습할까요?</h3>
</BottomSheet>
```

- 시트 안 주 액션은 `<Button block size="lg">`.
