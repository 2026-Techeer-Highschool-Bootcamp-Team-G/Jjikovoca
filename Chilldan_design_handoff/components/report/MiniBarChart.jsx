import React from 'react'

/** 주간 학습 시간 분포 막대 (FR-09) — 라벨 7칸 이하의 작은 카드용 차트 */
export function MiniBarChart({ data = [], height = 96, unit = '분', highlightMax = true }) {
  const max = Math.max(...data.map((d) => d.value || 0), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height, fontFamily: 'var(--font-sans)' }}>
      {data.map((d) => {
        const isMax = highlightMax && d.value === max
        return (
          <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
            <span style={{ marginTop: 'auto', fontSize: 10, fontWeight: 700, color: isMax ? 'var(--color-text-brand)' : 'var(--color-text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
              {d.value}
            </span>
            <div
              style={{
                width: '100%',
                height: Math.max(3, ((d.value || 0) / max) * (height - 36)),
                borderRadius: 4,
                background: isMax ? 'var(--color-brand-primary)' : 'var(--color-brand-weak)',
                transition: 'height 280ms var(--ease-standard)',
              }}
            />
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{d.label}</span>
          </div>
        )
      })}
      <span style={{ alignSelf: 'flex-start', fontSize: 10, color: 'var(--color-text-tertiary)' }}>{unit}</span>
    </div>
  )
}
