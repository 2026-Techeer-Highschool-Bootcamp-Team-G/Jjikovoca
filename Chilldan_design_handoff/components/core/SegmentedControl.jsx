import React from 'react'

/** 2~3지 세그먼트 컨트롤 — 테마 설정(라이트/다크/시스템 자동, FR-17), 발음 로케일 등 */
export function SegmentedControl({ options = [], value, onChange, block = false, size = 'md' }) {
  const h = size === 'sm' ? 32 : 40
  return (
    <div
      role="tablist"
      style={{
        display: block ? 'flex' : 'inline-flex',
        padding: 3,
        gap: 3,
        background: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange && onChange(o.value)}
            style={{
              flex: block ? 1 : undefined,
              height: h,
              minWidth: 64,
              padding: '0 14px',
              border: 'none',
              borderRadius: 'calc(var(--radius-md) - 3px)',
              background: active ? 'var(--color-bg-primary)' : 'transparent',
              boxShadow: active ? 'var(--shadow-card)' : 'none',
              color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              fontFamily: 'inherit',
              fontSize: size === 'sm' ? 12 : 14,
              fontWeight: active ? 700 : 500,
              cursor: 'pointer',
              transition: 'background 160ms var(--ease-standard), color 160ms var(--ease-standard)',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
