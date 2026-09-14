import React from 'react'

// TDS Tab (9:21). Selected: 텍스트 강조 + 2px 브랜드 인디케이터 / Default: tertiary.
// 인디케이터는 단일 바가 선택 탭 위치로 슬라이드한다.
export function Tabs({ tabs, value, onChange }) {
  const selectedIndex = Math.max(0, tabs.findIndex((t) => t.key === value))
  return (
    <div style={{ position: 'relative', display: 'flex', height: 46, background: 'var(--color-bg-primary)', borderBottom: '1px solid var(--color-border-default)' }}>
      {tabs.map((tab) => {
        const selected = tab.key === value
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange && onChange(tab.key)}
            style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 12, paddingBottom: 12, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 15,
                fontWeight: selected ? 500 : 400,
                color: selected ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                transition: 'color 0.2s ease',
              }}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 2,
          width: 100 / tabs.length + '%',
          background: 'var(--color-brand-primary)',
          transform: 'translateX(' + selectedIndex * 100 + '%)',
          transition: 'transform 0.28s var(--ease-standard)',
        }}
      />
    </div>
  )
}
