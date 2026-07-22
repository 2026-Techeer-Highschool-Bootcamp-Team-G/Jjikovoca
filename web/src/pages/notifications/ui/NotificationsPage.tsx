import type { ComponentType } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavigationBar, IconClock, IconTrophy, IconCheck, IconRefresh } from '@/shared/ui'

interface Noti {
  icon: ComponentType<{ size?: number }>
  title: string
  time: string
}

const NOTIS: Noti[] = [
  { icon: IconClock, title: '복습 대기 카드 12장이 기다리고 있어요', time: '방금 전' },
  { icon: IconTrophy, title: "'plant' 카드가 졸업했어요 🎉", time: '2시간 전' },
  { icon: IconCheck, title: '주간 퀘스트 완료! +50 XP를 받았어요', time: '어제' },
  { icon: IconRefresh, title: '무료 분석 횟수 5회가 충전됐어요', time: '어제' },
]

/** 알림 (04 알림) */
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '16px var(--spacing-xl) 24px' }}>
        {NOTIS.map((noti, i) => (
          <NotiCard key={i} noti={noti} />
        ))}
      </div>
    </div>
  )
}

function NotiCard({ noti }: { noti: Noti }) {
  const Icon = noti.icon
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        background: 'var(--color-bg-elevated)',
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
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
          {noti.title}
        </span>
        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{noti.time}</span>
      </div>
    </div>
  )
}
