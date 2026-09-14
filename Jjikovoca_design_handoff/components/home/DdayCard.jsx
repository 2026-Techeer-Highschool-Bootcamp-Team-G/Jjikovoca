import React from 'react'
import { Icon } from '../core/Icon'

// D-day 경각심 색 — 초록(여유) → 연두 → 주황 → 빨강(임박)
function ddayColor(dday) {
  if (dday > 30) return { bg: 'var(--color-dday-safe-bg)', fg: 'var(--color-dday-safe-fg)' }
  if (dday > 20) return { bg: 'var(--color-dday-soon-bg)', fg: 'var(--color-dday-soon-fg)' }
  if (dday > 15) return { bg: 'var(--color-dday-near-bg)', fg: 'var(--color-dday-near-fg)' }
  return { bg: 'var(--color-dday-urgent-bg)', fg: 'var(--color-dday-urgent-fg)' }
}

// 시험 D-day 카드 (74:81). onClick 있으면 탭 가능(chevron), 없으면 정보 카드.
export function DdayCard({ title, dday, memoryRate, todayDue, subtitle, onClick }) {
  let sub = subtitle
  if (!sub) {
    const parts = []
    if (memoryRate !== undefined) parts.push('시험범위 기억률 ' + memoryRate + '%')
    if (todayDue !== undefined) parts.push('오늘 복습 ' + todayDue + '개')
    sub = parts.length ? parts.join(' · ') : undefined
  }
  const dc = ddayColor(dday)
  const cardStyle = {
    display: 'flex',
    gap: 'var(--spacing-md)',
    alignItems: 'center',
    width: '100%',
    textAlign: 'left',
    background: 'var(--color-brand-weak)',
    border: 'none',
    borderRadius: 'var(--radius-card-14)',
    padding: '14px 16px',
    fontFamily: 'var(--font-sans)',
  }
  const inner = (
    <>
      <span style={{ display: 'inline-flex', color: 'var(--color-brand-primary)' }} aria-hidden>
        <Icon name="calendar" size={20} />
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 8px', borderRadius: 'var(--radius-sm)', background: dc.bg, color: dc.fg, fontSize: 12, fontWeight: 700 }}>
            D-{dday}
          </span>
        </div>
        {sub && <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{sub}</span>}
      </div>
      {onClick && (
        <span style={{ color: 'var(--grey-500)', display: 'inline-flex' }}>
          <Icon name="chevron-right" size={18} />
        </span>
      )}
    </>
  )
  if (onClick) {
    return (
      <button type="button" onClick={onClick} style={{ ...cardStyle, cursor: 'pointer' }}>
        {inner}
      </button>
    )
  }
  return <div style={cardStyle}>{inner}</div>
}
