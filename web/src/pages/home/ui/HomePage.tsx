import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AppHeader } from '@/widgets/app-header'
import { GameStatusCard } from '@/widgets/game-status'
import { DdayCard } from '@/widgets/dday-card'
import { RecentCarousel } from '@/widgets/recent-cards'
import { Tabs, ListHeader } from '@/shared/ui'
import type { FeedSubject } from '@/entities/card'
import { fetchExpSummary, attend } from '@/entities/exp'
import { fetchExams } from '@/entities/exam'
import { fetchReviewQueue } from '@/features/study'

const SUBJECT_TABS: { key: FeedSubject; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'ENGLISH', label: '영어' },
  { key: 'MATH', label: '수학' },
]

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

  // 실 API 조회 — 실패/빈 응답은 가짜값으로 가리지 않고 0/빈 상태로 정직하게 표시
  const exp = useQuery({ queryKey: ['exp-summary'], queryFn: fetchExpSummary })
  const exams = useQuery({ queryKey: ['exams'], queryFn: fetchExams })
  const review = useQuery({ queryKey: ['review-queue'], queryFn: () => fetchReviewQueue() })

  // 출석 체크 — 진입 시 1회(서버 멱등)
  useEffect(() => {
    attend().catch(() => {})
  }, [])

  const e = exp.data
  const level = e?.level ?? 0
  const expVal = e?.exp ?? 0
  const nextExp = e?.nextLevelExp ?? 0
  const streakDays = e?.streakDays ?? 0

  // 가장 가까운 시험 — 없으면 가짜 D-day 대신 등록 유도
  const nearest = exams.data?.[0]
  const todayDue = review.data?.dueCount ?? 0

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
          level={level}
          heroTitle="단어 헌터"
          exp={expVal}
          nextExp={nextExp}
          streakDays={streakDays}
          questLabel={`일일 퀘스트 — 복습 ${todayDue}개 · 달성 시 +40XP`}
        />
        {nearest ? (
          <DdayCard title={nearest.title} dday={nearest.dday} todayDue={todayDue} onClick={() => navigate('/exam')} />
        ) : (
          <button
            type="button"
            onClick={() => navigate('/exam')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              padding: '14px 16px',
              borderRadius: 14,
              border: '1px dashed var(--color-border-default)',
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text-secondary)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            📅 시험을 등록하고 D-day·복습 일정을 받아보세요
            <span aria-hidden>›</span>
          </button>
        )}

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

      <div style={{ padding: '4px 0 24px' }}>
        <RecentCarousel subject={subject} />
      </div>
    </div>
  )
}
