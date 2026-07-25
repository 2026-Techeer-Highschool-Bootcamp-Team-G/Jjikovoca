import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { NavigationBar, IconClock, IconTrophy, IconRefresh } from '@/shared/ui'
import { fetchNotifications, markNotificationsRead } from '@/entities/notification'
import type { AppNotification, NotificationType } from '@/entities/notification'

// 유형별 아이콘
const ICON: Record<NotificationType, typeof IconClock> = {
  REVIEW_DUE: IconClock,
  STREAK: IconRefresh,
  LEVEL_UP: IconTrophy,
}

// ISO → 상대 시각(방금 전 / N분 전 / N시간 전 / N일 전)
function relTime(iso: string): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const diff = Date.now() - t
  const m = Math.floor(diff / 60000)
  if (m < 1) return '방금 전'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  const d = Math.floor(h / 24)
  return d === 1 ? '어제' : `${d}일 전`
}

/** 알림 (04 알림) — GET /api/notifications 실연동, 진입 시 읽음 처리 */
export function NotificationsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications })
  const list = data ?? []

  // 진입 시 안 읽은 저장형 알림 읽음 처리(홈 벨 배지 해제용)
  const read = useMutation({
    mutationFn: markNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
  useEffect(() => {
    read.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-secondary)' }}>
      <NavigationBar title="알림" onBack={() => navigate(-1)} />

      {list.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 24px' }}>
          <span style={{ fontSize: 32 }} aria-hidden>
            🔔
          </span>
          <p style={{ margin: 0, textAlign: 'center', fontSize: 14, color: 'var(--color-text-tertiary)' }}>
            {isLoading ? '불러오는 중…' : '아직 새로운 알림이 없어요'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '16px var(--spacing-xl) 24px' }}>
          {list.map((n, i) => (
            <NotiCard key={n.id ?? `d-${i}`} noti={n} />
          ))}
        </div>
      )}
    </div>
  )
}

function NotiCard({ noti }: { noti: AppNotification }) {
  const Icon = ICON[noti.type] ?? IconClock
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        background: noti.read ? 'var(--color-bg-elevated)' : 'var(--color-brand-weak)',
        borderRadius: 16,
        padding: 14,
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: 20,
          background: 'var(--color-brand-weak)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-brand)',
        }}
      >
        <Icon size={20} />
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{noti.message}</span>
        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{relTime(noti.createdAt)}</span>
      </div>
    </div>
  )
}
