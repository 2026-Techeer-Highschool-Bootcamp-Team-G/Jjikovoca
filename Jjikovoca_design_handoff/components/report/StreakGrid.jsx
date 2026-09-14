import React from 'react'

const LEVEL = ['var(--color-grass-0)', 'var(--color-grass-1)', 'var(--color-grass-2)', 'var(--color-grass-3)', 'var(--color-grass-4)']

/** 학습 잔디 (FR-14) — 연속 학습일을 일별로 칠하는 GitHub 스타일 그리드 */
export function StreakGrid({ days = [], weeks = 13, streakDays, cell = 12, gap = 3, showLegend = true }) {
  const total = weeks * 7
  const padded = days.length >= total ? days.slice(days.length - total) : [...Array(total - days.length).fill(0), ...days]
  const columns = []
  for (let w = 0; w < weeks; w++) columns.push(padded.slice(w * 7, w * 7 + 7))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'var(--font-sans)' }}>
      {streakDays != null && (
        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          🔥 연속 <strong style={{ color: 'var(--color-text-primary)' }}>{streakDays}일</strong> 학습 중
        </span>
      )}
      <div style={{ display: 'flex', gap, overflowX: 'auto' }}>
        {columns.map((col, ci) => (
          <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap }}>
            {col.map((lv, ri) => (
              <span key={ri} style={{ width: cell, height: cell, borderRadius: 3, background: LEVEL[Math.max(0, Math.min(4, lv))] }} />
            ))}
          </div>
        ))}
      </div>
      {showLegend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--color-text-tertiary)' }}>
          <span>적음</span>
          {LEVEL.map((c) => <span key={c} style={{ width: 10, height: 10, borderRadius: 3, background: c }} />)}
          <span>많음</span>
        </div>
      )}
    </div>
  )
}
