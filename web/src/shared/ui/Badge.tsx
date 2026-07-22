import type { ReactNode } from 'react'

export type BadgeColor = 'blue' | 'green' | 'red' | 'yellow' | 'grey'
export type BadgeVariant = 'fill' | 'weak'

interface Props {
  color?: BadgeColor
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  children: ReactNode
}

// TDS Badge (7:42). Fill=강조 / Weak=보조. 용례: 박스 레벨(blue)·졸업(green)·몰라요(red)·복습예정(yellow)·과목(grey)
const FILL: Record<BadgeColor, { bg: string; fg: string }> = {
  blue: { bg: 'var(--color-brand-primary)', fg: 'var(--color-text-inverse)' },
  green: { bg: 'var(--color-success-primary)', fg: 'var(--color-text-inverse)' },
  red: { bg: 'var(--color-danger-primary)', fg: 'var(--color-text-inverse)' },
  yellow: { bg: 'var(--color-warning-primary)', fg: 'var(--yellow-900)' },
  grey: { bg: 'var(--grey-500)', fg: 'var(--color-text-inverse)' },
}

const WEAK: Record<BadgeColor, { bg: string; fg: string }> = {
  blue: { bg: 'var(--color-brand-weak)', fg: 'var(--color-text-brand)' },
  green: { bg: 'var(--color-success-weak)', fg: 'var(--color-success-primary)' },
  red: { bg: 'var(--color-danger-weak)', fg: 'var(--color-text-danger)' },
  yellow: { bg: 'var(--color-warning-weak)', fg: 'var(--yellow-900)' },
  grey: { bg: 'var(--color-bg-secondary)', fg: 'var(--color-text-secondary)' },
}

export function Badge({ color = 'blue', variant = 'fill', size = 'sm', children }: Props) {
  const { bg, fg } = variant === 'fill' ? FILL[color] : WEAK[color]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: bg,
        color: fg,
        fontSize: size === 'sm' ? 11 : 12,
        fontWeight: 500,
        lineHeight: 1,
        padding: size === 'sm' ? '3px 6px' : '4px 8px',
        borderRadius: 'var(--radius-xs)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}
