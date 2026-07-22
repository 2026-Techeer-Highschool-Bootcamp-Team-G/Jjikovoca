import type { ReactNode } from 'react'
import { Badge, IconChevronRight } from '@/shared/ui'

interface Props {
  title: string
  dday: number
  memoryRate?: number
  todayDue?: number
  subtitle?: string
  onClick?: () => void
}

// 시험 D-day 카드 (74:81, F-19/F-29). onClick 있으면 탭 가능(chevron), 없으면 정보 카드.
export function DdayCard({ title, dday, memoryRate, todayDue, subtitle, onClick }: Props) {
  let sub = subtitle
  if (!sub) {
    const parts: string[] = []
    if (memoryRate !== undefined) parts.push(`시험범위 기억률 ${memoryRate}%`)
    if (todayDue !== undefined) parts.push(`오늘 복습 ${todayDue}개`)
    sub = parts.length ? parts.join(' · ') : undefined
  }

  const cardStyle = {
    display: 'flex',
    gap: 'var(--spacing-md)',
    alignItems: 'center',
    width: '100%',
    textAlign: 'left' as const,
    background: 'var(--color-brand-weak)',
    border: 'none',
    borderRadius: 14,
    padding: '14px 16px',
  }

  const inner: ReactNode = (
    <>
      <span style={{ fontSize: 20 }} aria-hidden>
        📅
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {title}
          </span>
          <Badge color="blue">D-{dday}</Badge>
        </div>
        {sub && <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{sub}</span>}
      </div>
      {onClick && (
        <span style={{ color: 'var(--grey-500)', display: 'inline-flex' }}>
          <IconChevronRight size={18} />
        </span>
      )}
    </>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} style={{ ...cardStyle, cursor: 'pointer' }}>
        {inner}
      </button>
    )
  }
  return <div style={cardStyle}>{inner}</div>
}
