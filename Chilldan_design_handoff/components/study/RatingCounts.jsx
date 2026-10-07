import React from 'react'

const ITEMS = [
  { key: 'know', label: '알', fg: 'var(--color-rating-know)', bg: 'var(--color-rating-know-weak)' },
  { key: 'confused', label: '헷', fg: 'var(--color-rating-confused)', bg: 'var(--color-rating-confused-weak)' },
  { key: 'dontKnow', label: '몰', fg: 'var(--color-rating-dont-know)', bg: 'var(--color-rating-dont-know-weak)' },
]

/** 단어별 알/헷/몰 누적 횟수 (FR-18) — 단어장 행과 단어 상세에 붙는다 */
export function RatingCounts({ know = 0, confused = 0, dontKnow = 0, size = 'md', showZero = true }) {
  const counts = { know, confused, dontKnow }
  const font = size === 'sm' ? 10 : 11
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-sans)' }}>
      {ITEMS.filter((i) => showZero || counts[i.key] > 0).map((i) => (
        <span
          key={i.key}
          title={i.label === '알' ? '알아요' : i.label === '헷' ? '헷갈려요' : '몰라요'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            padding: size === 'sm' ? '2px 6px' : '3px 7px',
            borderRadius: 'var(--radius-full)',
            background: i.bg,
            color: i.fg,
            fontSize: font,
            fontWeight: 700,
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
          }}
        >
          {i.label}
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{counts[i.key]}</span>
        </span>
      ))}
    </div>
  )
}
