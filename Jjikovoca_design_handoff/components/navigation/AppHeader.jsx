import React from 'react'
import { Icon } from '../core/Icon'

// 홈 상단 헤더 — 브랜드 로고타입 + 알림(같은 선상)
export function AppHeader({ onBell }) {
  return (
    <header style={{ padding: '10px var(--spacing-xl) 4px', fontFamily: 'var(--font-sans)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--color-text-brand)' }}>찍어보카</h1>
        <button
          type="button"
          aria-label="알림"
          onClick={onBell}
          style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
        >
          <Icon name="bell" size={22} />
        </button>
      </div>
    </header>
  )
}
