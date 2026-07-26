import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AppHeader } from '@/widgets/app-header'
import { DdayCard } from '@/widgets/dday-card'
import { RecentCarousel } from '@/widgets/recent-cards'
import { Tabs, ListHeader, IconCalendar } from '@/shared/ui'
import type { FeedSubject } from '@/entities/card'
import { attend } from '@/entities/exp'
import { fetchExams } from '@/entities/exam'
import { fetchReviewQueue, fetchRecommendation } from '@/features/study'

const SUBJECT_TABS: { key: FeedSubject; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'ENGLISH', label: '영어' },
  { key: 'MATH', label: '수학' },
]

/**
 * 게임형 홈 (F-16) — 03 홈. 상단은 시험 D-day·시험범위 기억률·오늘 복습 중심.
 * 게임 상태(Lv/XP/연속/퀘스트)는 마이페이지로, 동기부여 명언은 학습 시작 로딩으로 이동했다.
 */
export function HomePage() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState<FeedSubject>('ALL')

  // 실 API 조회 — 실패/빈 응답은 가짜값으로 가리지 않고 빈 상태로 정직하게 표시
  const exams = useQuery({ queryKey: ['exams'], queryFn: fetchExams })
  const review = useQuery({ queryKey: ['review-queue'], queryFn: () => fetchReviewQueue() })
  const rec = useQuery({ queryKey: ['recommendation'], queryFn: fetchRecommendation })

  // 출석 체크 — 진입 시 1회(서버 멱등)
  useEffect(() => {
    attend().catch(() => {})
  }, [])

  // 가장 가까운 시험 — 없으면 가짜 D-day 대신 등록 유도
  const nearest = exams.data?.[0]
  const todayDue = review.data?.dueCount ?? 0
  // 시험범위 기억률 ← 추천 통계의 평균 회상확률 R(0~1). 없으면 미표시
  const memoryRate = rec.data?.memoryRate != null ? Math.round(rec.data.memoryRate * 100) : undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <AppHeader onBell={() => navigate('/notifications')} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: '6px var(--spacing-xl) 0',
        }}
      >
        {nearest ? (
          <DdayCard
            title={nearest.title}
            dday={nearest.dday}
            memoryRate={memoryRate}
            todayDue={todayDue}
            onClick={() => navigate('/exam')}
          />
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
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <IconCalendar size={16} />
              시험을 등록하고 D-day·복습 일정을 받아보세요
            </span>
            <span aria-hidden>›</span>
          </button>
        )}
      </div>

      <div style={{ marginTop: 10, background: 'var(--color-bg-primary)' }}>
        <Tabs tabs={SUBJECT_TABS} value={subject} onChange={setSubject} />
        <ListHeader title="최근 카드" link="전체 보기" onLink={() => navigate('/wrong-note')} />
      </div>

      <div style={{ padding: '4px 0 24px' }}>
        <RecentCarousel subject={subject} />
      </div>
    </div>
  )
}
