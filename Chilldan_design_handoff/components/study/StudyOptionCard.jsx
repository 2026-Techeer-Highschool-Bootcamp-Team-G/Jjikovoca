import React from 'react'
import { Icon } from '../core/Icon'

/** 학습 진입 선택 카드 (FR-12) — 복습 방식 3종·퀴즈 유형 2종을 고르는 큰 탭 영역 */
export function StudyOptionCard({ emoji, icon, title, description, meta, selected = false, disabled = false, onClick }) {
  const [pressed, setPressed] = React.useState(false)
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        minHeight: 72,
        padding: '14px 16px',
        textAlign: 'left',
        background: selected ? 'var(--color-brand-weak)' : 'var(--color-bg-primary)',
        border: selected ? '1.5px solid var(--color-brand-primary)' : '1.5px solid var(--color-border-default)',
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-sans)',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transform: pressed && !disabled ? 'scale(0.98)' : undefined,
        transition: 'background 160ms var(--ease-standard), border-color 160ms var(--ease-standard), transform 120ms var(--ease-standard)',
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: 40,
          height: 40,
          borderRadius: 12,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          background: selected ? 'var(--color-bg-primary)' : 'var(--color-bg-secondary)',
          color: 'var(--color-text-brand)',
        }}
        aria-hidden
      >
        {icon ? <Icon name={icon} size={20} /> : emoji}
      </span>
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</span>
        {description && <span style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>{description}</span>}
      </span>
      {meta && <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: selected ? 'var(--color-text-brand)' : 'var(--color-text-tertiary)' }}>{meta}</span>}
    </button>
  )
}
