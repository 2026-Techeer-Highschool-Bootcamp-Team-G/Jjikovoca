import { Outlet } from 'react-router-dom'
import { BottomNav } from '@/widgets/bottom-nav'

/** 앱 셸 — 모바일 세로 레이아웃 + 하단 내비 */
export function App() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        maxWidth: 480,
        margin: '0 auto',
        background: 'var(--color-bg-secondary)',
      }}
    >
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
