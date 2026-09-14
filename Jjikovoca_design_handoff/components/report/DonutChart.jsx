import React from 'react'

/** 도넛 차트 (FR-09) — 리포트의 정답률·학습 비중. 방사형(레이더) 차트는 v1.9 에서 제거됐다 */
export function DonutChart({ segments = [], size = 132, thickness = 16, centerValue, centerLabel }) {
  const total = segments.reduce((s, x) => s + (x.value || 0), 0) || 1
  let acc = 0
  const stops = segments.map((s) => {
    const from = (acc / total) * 100
    acc += s.value || 0
    const to = (acc / total) * 100
    return (s.color || 'var(--color-brand-primary)') + ' ' + from + '% ' + to + '%'
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'var(--font-sans)' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'conic-gradient(' + stops.join(',') + ')' }} />
        <div
          style={{
            position: 'absolute',
            inset: thickness,
            borderRadius: '50%',
            background: 'var(--color-bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          {centerValue != null && <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>{centerValue}</span>}
          {centerLabel && <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{centerLabel}</span>}
        </div>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        {segments.map((s) => (
          <li key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color || 'var(--color-brand-primary)', flexShrink: 0 }} />
            <span style={{ color: 'var(--color-text-primary)' }}>{s.label}</span>
            <span style={{ marginLeft: 'auto', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{Math.round(((s.value || 0) / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
