import type { ReactNode } from 'react'

interface Props {
  active?: boolean
  onClick?: () => void
  children: ReactNode
}

export function Chip({ active = false, onClick, children }: Props) {
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
        fontSize: 14,
      }}
    >
      {children}
    </button>
  )
}
