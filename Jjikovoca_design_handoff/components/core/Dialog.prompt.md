확인 모달. 내용은 직접 구성한다(제목 17/700 + 설명 14/secondary + 버튼 한 줄).

```jsx
<Dialog open={open} onClose={close}>
  <h2 style={{margin:0,fontSize:17,fontWeight:700}}>정말 탈퇴할까요?</h2>
</Dialog>
```

- 목록형 선택·학습 설정은 Dialog 가 아니라 BottomSheet.
