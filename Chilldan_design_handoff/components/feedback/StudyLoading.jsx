import React from 'react'

const STUDY_QUOTES = [
  '어제의 나보다 딱 한 걸음만 더 나아가자',
  '오늘 한 문제가 내일의 자신감이 된다',
  '꾸준함이 결국 실력을 만든다',
  '틀린 문제는 실력이 자라는 자리',
  '지금 이 복습이 시험날의 여유가 된다',
]

/** 학습 큐 로딩 화면 — 스피너 + 명언. 플래시카드·빈칸·수학 학습 진입 로딩에 공용 */
export function StudyLoading({ quote }) {
  const [picked] = React.useState(() => quote || STUDY_QUOTES[Math.floor(Math.random() * STUDY_QUOTES.length)])
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 32px', fontFamily: 'var(--font-sans)' }}>
      <div
        aria-hidden
        style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--color-brand-weak)', borderTopColor: 'var(--color-brand-primary)', animation: 'jjik-spin 0.8s linear infinite' }}
      />
      <blockquote style={{ margin: 0, textAlign: 'center' }}>
        <span style={{ fontSize: 15, fontWeight: 500, fontStyle: 'italic', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>“{picked}”</span>
      </blockquote>
      <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>학습을 준비하고 있어요…</span>
    </div>
  )
}
