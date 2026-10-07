설정·목록 행. 흰 배경에 얇은 divider 로 이어 붙이고, 그룹 사이는 회색 여백으로 끊는다.

```jsx
<ListRow title="📅 시험 일정" value="중간고사 D-12" valueColor="var(--color-brand-primary)" divider onClick={go} />
```

- 마지막 행은 `divider` 를 끈다.
- 이동이 없는 행(로그아웃 등)은 `showArrow={false}`.
