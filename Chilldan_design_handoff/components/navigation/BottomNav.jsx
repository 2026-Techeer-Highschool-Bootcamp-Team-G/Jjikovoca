import React from 'react'
import { Icon } from '../core/Icon'
import { AppLogo } from '../core/AppLogo'

const LEFT = [
  { key: 'home', label: '홈', icon: 'home' },
  { key: 'vocab', label: '단어장', icon: 'vocab' },
]
const RIGHT = [
  { key: 'report', label: '리포트', icon: 'chart' },
  { key: 'my', label: '마이', icon: 'user' },
]

// 하단 내비게이션 (21:22) — 4탭 + 중앙 앱 로고 FAB(촬영 진입, 돌출, 라벨 없음)
export function BottomNav({ active = 'home', onSelect, onCapture }) {
  const item = (it) => (
    <button
      key={it.key}
      type="button"
      onClick={() => onSelect && onSelect(it.key)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        flex: 1,
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        color: active === it.key ? 'var(--color-text-brand)' : 'var(--color-text-tertiary)',
      }}
    >
      <Icon name={it.icon} size={24} />
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: active === it.key ? 500 : 400 }}>{it.label}</span>
    </button>
  )
  return (
    <nav
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'flex-start',
        height: 82,
        padding: '8px 24px 24px',
        background: 'var(--color-bg-primary)',
        borderTop: '1px solid var(--color-border-default)',
      }}
    >
      {LEFT.map(item)}
      <div style={{ flex: 1 }} aria-hidden />
      {RIGHT.map(item)}
      <button
        type="button"
        aria-label="촬영"
        onClick={onCapture}
        style={{
          position: 'absolute',
          left: '50%',
          top: -16,
          transform: 'translateX(-50%)',
          width: 56,
          height: 56,
          padding: 0,
          border: 'none',
          background: 'none',
          borderRadius: 'var(--radius-logo-13)',
          display: 'flex',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-fab)',
        }}
      >
        <AppLogo size={56} />
      </button>
    </nav>
  )
}
