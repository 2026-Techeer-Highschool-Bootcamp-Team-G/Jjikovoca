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

// 홈 QA #4 — 동기부여 문구 풀(매 진입 랜덤)
const HOME_QUOTES = [
  '어제의 나보다 딱 한 걸음만 더 나아가자',
  '오늘 한 문제가 내일의 자신감이 된다',
  '꾸준함이 결국 실력을 만든다',
]

/** 게임형 홈 (F-16) — 03 홈 */
export function HomePage() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState<FeedSubject>('ALL')
  const [quote] = useState(() => HOME_QUOTES[Math.floor(Math.random() * HOME_QUOTES.length)])

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

        {/* 홈 QA #4 — 동기부여 문구 (D-day 카드 아래) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 12,
            background: 'var(--color-bg-secondary)',
          }}
        >
          <span style={{ fontSize: 15 }} aria-hidden>
            💪
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>{quote}</span>
        </div>
      </div>

      <div style={{ marginTop: 16, background: 'var(--color-bg-primary)' }}>
        <Tabs tabs={SUBJECT_TABS} value={subject} onChange={setSubject} />
        <ListHeader title="최근 카드" link="전체 보기" onLink={() => navigate('/wrong-note')} />
      </div>

      <div style={{ padding: '16px var(--spacing-xl) 24px' }}>
        <WordCard card={recentCard} result="WRONG" onClick={() => navigate('/wrong-note')} />
      </div>
    </div>
  )
}
