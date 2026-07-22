import { IconBell, IconMenu } from '@/shared/ui'

interface Props {
  onMenu?: () => void
  onBell?: () => void
}

// 홈 상단 헤더 — 메뉴·알림 행 + 브랜드 타이틀 (03 홈)
export function AppHeader({ onMenu, onBell }: Props) {
  const iconBtn = {
    background: 'none',
    border: 'none',
    padding: 0,
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
  } as const
  return (
    <header style={{ padding: '12px var(--spacing-xl) 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" aria-label="메뉴" onClick={onMenu} style={iconBtn}>
          <IconMenu />
        </button>
        <button type="button" aria-label="알림" onClick={onBell} style={iconBtn}>
          <IconBell />
        </button>
      </div>
      <h1
        style={{
          margin: '10px 0 0',
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--color-text-brand)',
        }}
      >
        찍어보카
      </h1>
    </header>
  )
}
