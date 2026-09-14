입력 필드 — 배경 채움(#f2f4f6), 테두리 없음, 높이 52px.

```jsx
<TextField value={email} onChange={setEmail} placeholder="이메일" type="email" />
```

- 로그인 화면처럼 맥락이 분명하면 `label` 없이 placeholder 만 쓴다.
- 에러는 필드 밖에 13px `--color-text-danger` 문장으로 따로 보여준다.
