import type { ReactNode } from 'react'
import { IconChevronLeft } from './icons'

interface Props {
  title: string
  right?: ReactNode
  onBack?: () => void
}

// TDS NavigationBar (9:3) — 좌 뒤로가기(44 터치영역) · 중앙 타이틀 · 우 액션 슬롯
export function NavigationBar({ title, right, onBack }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 56,
        padding: '0 8px',
        background: 'var(--color-bg-primary)',
      }}
    >
      <button
        type="button"
        aria-label="뒤로"
        onClick={onBack}
        style={{
          width: 44,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
        }}
      >
        <IconChevronLeft />
      </button>
      <span
        style={{
          flex: 1,
          textAlign: 'center',
          fontSize: 17,
          fontWeight: 500,
          color: 'var(--color-text-primary)',
        }}
      >
        {title}
      </span>
      <div
        style={{
          minWidth: 44,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: 8,
        }}
      >
        {right}
      </div>
    </div>
  )
}
