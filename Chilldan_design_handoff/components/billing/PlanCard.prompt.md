구독 플랜 카드 (FR-19) — Free / Plus(월 3,900원 · 20회) / Pro(월 6,900원 · 40회).

```jsx
<PlanCard name="Plus" price={3900} quota="사진 분석 하루 20회" recommended features={['AI 연상 이미지 무제한', '시험지 PDF 내보내기']} onSelect={buy} />
```

- 결제 화면에는 갱신 주기·해지 방법·약관 링크를 카드 아래 캡션으로 반드시 함께 노출한다(스토어 심사 요건).
- 결제는 네이티브 IAP 로만 진행한다 — 외부 PG·아웃링크 버튼을 만들지 않는다.
