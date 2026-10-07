import React from 'react'

// 필터 칩 — 선택 시 브랜드 파랑 fill, 기본은 흰 배경 + 회색 테두리
export function Chip({ active = false, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: 'var(--spacing-xs) var(--spacing-md)',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--color-border-default)',
        background: active ? 'var(--color-brand-primary)' : 'var(--color-bg-primary)',
        color: active ? 'var(--common-white)' : 'var(--color-text-secondary)',
        fontFamily: 'var(--font-sans)',
        fontSize: 14,
      }}
    >
      {children}
    </button>
  )
}
