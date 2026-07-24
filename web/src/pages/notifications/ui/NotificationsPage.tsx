import { useNavigate } from 'react-router-dom'
import { NavigationBar } from '@/shared/ui'

/** 알림 (04 알림) — 알림 피드 엔드포인트 미제공(백엔드 요청) → 빈 상태 */
export function NotificationsPage() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--color-bg-secondary)',
      }}
    >
      <NavigationBar title="알림" onBack={() => navigate(-1)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 24px' }}>
        <span style={{ fontSize: 32 }} aria-hidden>
          🔔
        </span>
        <p style={{ margin: 0, textAlign: 'center', fontSize: 14, color: 'var(--color-text-tertiary)' }}>
          아직 새로운 알림이 없어요
        </p>
      </div>
    </div>
  )
}
