import type { ReactNode } from 'react'
import { IconChevronRight } from './icons'

interface Props {
  icon?: ReactNode
  title: string
  subtitle?: string
  value?: string
  valueColor?: string
  onClick?: () => void
  showArrow?: boolean
  divider?: boolean
}

// TDS ListRow (8:11) — 좌 아이콘(40) · 중 제목/부제 · 우 값+화살표. 설정·목록 공용.
export function ListRow({
  icon,
  title,
  subtitle,
  value,
  valueColor,
  onClick,
  showArrow = true,
  divider = false,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        gap: 'var(--spacing-md)',
        alignItems: 'center',
        width: '100%',
        textAlign: 'left',
        height: 64,
        padding: '14px var(--spacing-xl)',
        background: 'var(--color-bg-primary)',
        border: 'none',
        borderBottom: divider ? '1px solid var(--color-border-default)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {icon && (
        <span
          style={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 20,
            background: 'var(--color-brand-weak)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 17, color: 'var(--color-text-primary)' }}>{title}</span>
        {subtitle && (
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{subtitle}</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
        {value && (
          <span style={{ fontSize: 15, color: valueColor ?? 'var(--color-text-secondary)' }}>
            {value}
          </span>
        )}
        {showArrow && (
          <span style={{ color: 'var(--grey-500)', display: 'inline-flex' }}>
            <IconChevronRight size={16} />
          </span>
        )}
      </div>
    </button>
  )
}
