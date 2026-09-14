import React from 'react'

/** 오답노트·보관함 썸네일 — 유형(형광펜/박스) 구분 */
export function CardThumb({ card }) {
  const isWord = card.type === 'WORD'
  const label = isWord ? card.word || '단어' : card.summary || '문제'
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        padding: 'var(--spacing-md)',
        background: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <span aria-hidden>{isWord ? '🖍️' : '⬛'}</span>
      <span style={{ fontWeight: 600 }}>{label}</span>
      {card.subject && <span style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{card.subject}</span>}
    </div>
  )
}
