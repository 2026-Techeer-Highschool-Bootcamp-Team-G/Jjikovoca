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
      {/* 고정된 하단 내비에 가려지지 않도록 nav 높이(+safe-area)만큼 여백 확보 */}
      <main style={{ flex: 1, paddingBottom: 'calc(82px + env(safe-area-inset-bottom))' }}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
