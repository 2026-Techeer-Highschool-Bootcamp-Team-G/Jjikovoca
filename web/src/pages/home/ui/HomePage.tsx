import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '@/widgets/app-header'
import { GameStatusCard } from '@/widgets/game-status'
import { DdayCard } from '@/widgets/dday-card'
import { WordCard } from '@/widgets/word-card'
import { Tabs, ListHeader } from '@/shared/ui'
import type { Card, FeedSubject } from '@/entities/card'

const SUBJECT_TABS: { key: FeedSubject; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'ENGLISH', label: '영어' },
  { key: 'MATH', label: '수학' },
]

// 백엔드 연결 전 데모 데이터 (프로토타입 03 홈과 동일 값)
const recentCard: Card = {
  id: 1,
  type: 'WORD',
  subject: 'ENGLISH',
  boxLevel: 2,
  graduated: false,
  createdAt: '2026-07-22T00:00:00Z',
  word: 'sound',
  contextMeaning: '타당한, 믿을 만한 (이 지문에서)',
  example: 'Her argument was sound and convincing.',
}

/** 게임형 홈 (F-16) — 03 홈 */
export function HomePage() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState<FeedSubject>('ALL')

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <AppHeader onBell={() => navigate('/notifications')} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '16px var(--spacing-xl) 0',
        }}
      >
        <GameStatusCard
          level={5}
          heroTitle="단어 헌터"
          exp={320}
          nextExp={400}
          streakDays={5}
          questLabel="일일 퀘스트 — 복습 12개 · 달성 시 +40XP"
        />
        <DdayCard title="중간고사" dday={7} memoryRate={62} todayDue={12} onClick={() => navigate('/exam')} />
      </div>

      <div style={{ marginTop: 16, background: 'var(--color-bg-primary)' }}>
        <Tabs tabs={SUBJECT_TABS} value={subject} onChange={setSubject} />
        <ListHeader title="최근 카드" link="전체 보기" onLink={() => navigate('/wrong-note')} />
      </div>

      <div style={{ padding: '16px var(--spacing-xl) 24px' }}>
        <WordCard card={recentCard} onClick={() => navigate('/wrong-note')} />
      </div>
    </div>
  )
}
