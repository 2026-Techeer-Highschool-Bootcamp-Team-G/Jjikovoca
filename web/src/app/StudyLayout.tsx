import { Outlet } from 'react-router-dom'

// 학습·플로우 화면 레이아웃 — 하단 탭 없이 전체 화면(자체 NavigationBar 사용)
export function StudyLayout() {
  return (
    <div
      style={{
        maxWidth: 480,
        margin: '0 auto',
        minHeight: '100vh',
        background: 'var(--color-bg-secondary)',
      }}
    >
      <Outlet />
    </div>
  )
}
