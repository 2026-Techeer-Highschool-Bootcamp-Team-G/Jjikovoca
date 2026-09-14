주 액션 버튼 — 화면당 파란 primary 는 하나만 두고, 보조 액션은 weak/ghost 로 내린다.

```jsx
<Button block size="lg" onClick={submit}>로그인</Button>
<Button block size="lg" variant="weak">이메일로 회원가입</Button>
```

- `variant`: `primary`(파랑 fill, CTA) · `weak`(brand-weak 배경, 보조) · `ghost`(흰 배경 + 회색 테두리)
- `size`: `lg`(52px, 하단 고정 CTA) · `md`(인라인)
- `disabled` 는 opacity 0.4. 로딩 중에는 라벨을 "로그인 중…" 처럼 바꾼다.
