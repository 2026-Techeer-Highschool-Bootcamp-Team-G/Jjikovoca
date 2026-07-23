import { IconBell } from '@/shared/ui'

interface Props {
  onBell?: () => void
}

// 홈 상단 헤더 — 브랜드 로고 + 알림(같은 선상) (03 홈)
export function AppHeader({ onBell }: Props) {
  return (
    <header style={{ padding: '12px var(--spacing-xl) 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--color-text-brand)' }}>찍어보카</h1>
        <button
          type="button"
          aria-label="알림"
          onClick={onBell}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'inline-flex',
          }}
        >
          <IconBell />
        </button>
      </div>
    </header>
  )
}
