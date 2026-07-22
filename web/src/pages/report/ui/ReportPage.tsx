import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

// 학습 잔디 4주 × 7일 (25:163) — 레벨 0~3 색상. 0=빈칸 / 3=진함
const GRASS: number[][] = [
  [0, 1, 2, 0, 3, 1, 0],
  [1, 2, 0, 1, 0, 2, 3],
  [0, 3, 1, 2, 1, 0, 1],
  [2, 0, 0, 3, 2, 1, 0],
]
const GRASS_COLOR = ['var(--color-bg-secondary)', '#b8ecd4', '#4fd89e', 'var(--color-success-primary)']

const WEAK = [
  { concept: '이차방정식 인수분해', ratio: 1, count: 5, to: '/math-answer' },
  { concept: '가정법 과거완료', ratio: 0.6, count: 3, to: '/flashcard' },
  { concept: '다의어 (sound 등)', ratio: 0.4, count: 2, to: '/flashcard' },
]

// 일일 학습 시간 주간 막대 (F-10 v1.4) — min = 높이 비율(%), study_log.duration_ms 집계 대용
const WEEK = [
  { day: '월', min: 42 },
  { day: '화', min: 68 },
  { day: '수', min: 30 },
  { day: '목', min: 84 },
  { day: '금', min: 56 },
  { day: '토', min: 22 },
  { day: '일', min: 100, today: true },
]

/** 학습 리포트 (F-10) — 13 리포트 */
export function ReportPage() {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'var(--color-bg-primary)', padding: '24px var(--spacing-xl) 16px' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          7월 리포트
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 15, color: 'var(--color-text-secondary)' }}>
          이번 달 학습 요약 — 프리미엄 리포트
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px var(--spacing-xl) 24px' }}>
        {/* 오늘 복습 대기 수 (F-10 v1.4 — FSRS dueCount, 홈·리포트 상단) */}
        <button
          type="button"
          onClick={() => navigate('/wrong-note')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '14px 16px',
            borderRadius: 16,
            background: 'var(--color-brand-primary)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-inverse)' }}>
            <span style={{ fontSize: 18 }} aria-hidden>🔔</span>
            <span style={{ fontSize: 15, fontWeight: 700 }}>오늘 복습 대기 12개</span>
          </span>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-inverse)', opacity: 0.9 }}>지금 복습 ›</span>
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          <StatCard label="새로 만든 카드" value="24장" />
          <StatCard label="단어 정답률" value="78%" accent />
        </div>

        <Card>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            이번 달 과목별 학습 비중
          </span>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Donut />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <LegendRow color="var(--blue-500)" subject="수학" pct="58%" pctColor="var(--blue-500)" detail="168분 · 96문제" />
              <LegendRow color="var(--teal-500)" subject="영어" pct="42%" pctColor="var(--teal-500)" detail="120분 · 84단어" />
            </div>
          </div>
          <span style={{ fontSize: 11, color: 'var(--grey-500)' }}>이번 달은 수학에 조금 더 집중했어요</span>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>학습 잔디</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
              이번 달 학습일 18일 · 연속 5일 🔥
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 18px)', gap: 8 }}>
            {GRASS.flat().map((lvl, i) => (
              <span key={i} style={{ width: 18, height: 18, borderRadius: 5, background: GRASS_COLOR[lvl] }} />
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>일일 학습 시간</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>평균 세션 24분</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 10, height: 96 }}>
            {WEEK.map((d) => (
              <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 22,
                      height: `${d.min}%`,
                      minHeight: 4,
                      borderRadius: 4,
                      background: d.today ? 'var(--color-brand-primary)' : 'var(--color-brand-weak)',
                    }}
                  />
                </div>
                <span style={{ fontSize: 10, color: d.today ? 'var(--color-text-brand)' : 'var(--color-text-tertiary)' }}>
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>지난달보다</span>
          <div style={{ display: 'flex', gap: 24 }}>
            <GrowthItem label="외운 단어" value="24" delta="▲ +8" />
            <GrowthItem label="정답률" value="78%" delta="▲ +6%p" />
            <GrowthItem label="학습일" value="18일" delta="▲ +3" />
          </div>
        </Card>

        <Card>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>
            나의 약한 개념 Top 3
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {WEAK.map((w, i) => (
              <button
                key={w.concept}
                type="button"
                onClick={() => navigate(w.to)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: 0,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-brand)', width: 12 }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--color-text-primary)' }}>{w.concept}</span>
                <div style={{ width: 76, height: 6, borderRadius: 3, background: 'var(--color-bg-secondary)', overflow: 'hidden' }}>
                  <div style={{ width: `${w.ratio * 100}%`, height: '100%', borderRadius: 3, background: 'var(--color-danger-primary)' }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', width: 24, textAlign: 'right' }}>
                  {w.count}회
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--color-bg-primary)',
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {children}
    </div>
  )
}

function StatCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      style={{
        background: 'var(--color-bg-primary)',
        borderRadius: 16,
        padding: '16px 16px 0',
        height: 84,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 24, fontWeight: 700, color: accent ? 'var(--color-text-brand)' : 'var(--color-text-primary)' }}>
        {value}
      </span>
    </div>
  )
}

function Donut() {
  return (
    <div
      style={{
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: 'conic-gradient(var(--blue-500) 0% 58%, var(--teal-500) 58% 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 78,
          height: 78,
          borderRadius: '50%',
          background: 'var(--color-bg-elevated)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>4h 48m</span>
        <span style={{ fontSize: 9, color: 'var(--color-text-tertiary)' }}>총 학습</span>
      </div>
    </div>
  )
}

function LegendRow({
  color,
  subject,
  pct,
  pctColor,
  detail,
}: {
  color: string
  subject: string
  pct: string
  pctColor: string
  detail: string
}) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', fontSize: 14, fontWeight: 700 }}>
          <span style={{ color: 'var(--color-text-primary)' }}>{subject}</span>
          <span style={{ color: pctColor }}>{pct}</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{detail}</span>
      </div>
    </div>
  )
}

function GrowthItem({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{label}</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>{value}</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: '#0a8a55',
            background: 'var(--color-success-weak)',
            borderRadius: 'var(--radius-full)',
            padding: '2px 6px',
          }}
        >
          {delta}
        </span>
      </div>
    </div>
  )
}
