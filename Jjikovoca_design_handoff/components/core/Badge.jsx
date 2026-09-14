import React from 'react'

// TDS Badge (7:42). Fill=강조 / Weak=보조. 용례: 박스 레벨(blue)·졸업(green)·몰라요(red)·복습예정(yellow)·과목(grey)
const FILL = {
  blue: { bg: 'var(--color-brand-primary)', fg: 'var(--color-text-inverse)' },
  green: { bg: 'var(--color-success-primary)', fg: 'var(--color-text-inverse)' },
  red: { bg: 'var(--color-danger-primary)', fg: 'var(--color-text-inverse)' },
  yellow: { bg: 'var(--color-accent)', fg: 'var(--color-on-accent)' },
  grey: { bg: 'var(--grey-500)', fg: 'var(--color-text-inverse)' },
}
const WEAK = {
  blue: { bg: 'var(--color-brand-weak)', fg: 'var(--color-text-brand)' },
  green: { bg: 'var(--color-success-weak)', fg: 'var(--color-success-primary)' },
  red: { bg: 'var(--color-danger-weak)', fg: 'var(--color-text-danger)' },
  yellow: { bg: 'var(--color-accent-weak)', fg: 'var(--color-on-accent)' },
  grey: { bg: 'var(--color-bg-secondary)', fg: 'var(--color-text-secondary)' },
}

export function Badge({ color = 'blue', variant = 'fill', size = 'sm', children }) {
  const { bg, fg } = variant === 'fill' ? FILL[color] : WEAK[color]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: bg,
        color: fg,
        fontFamily: 'var(--font-sans)',
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
