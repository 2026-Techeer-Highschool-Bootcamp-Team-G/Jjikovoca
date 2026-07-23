import type { ReactNode } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// 과목별 학습 비중 — 오늘 / 이번 달 (백엔드 연결 전 데모)
const SUBJECT = {
  TODAY: {
    total: '1h 20m',
    mathPct: 65,
    math: { pct: '65%', detail: '52분 · 28문제' },
    eng: { pct: '35%', detail: '28분 · 22단어' },
    caption: '오늘은 수학 위주로 공부했어요',
  },
  MONTH: {
    total: '4h 48m',
    mathPct: 58,
    math: { pct: '58%', detail: '168분 · 96문제' },
    eng: { pct: '42%', detail: '120분 · 84단어' },
    caption: '이번 달은 수학에 조금 더 집중했어요',
  },
} as const
type Scope = keyof typeof SUBJECT

// 학습 잔디 색상: 0=빈칸 / 3=진함 (당일 활동량이 많을수록 짙어짐)
const GRASS_COLOR = ['var(--color-bg-secondary)', '#b8ecd4', '#4fd89e', 'var(--color-success-primary)']

// 월별 학습 잔디 4주 × 7일 (25:163) — 백엔드 연결 전 데모
const MONTHS = [
  {
    label: '6월',
    days: 21,
    streak: 3,
    grass: [
      [1, 0, 2, 1, 3, 0, 1],
      [2, 1, 1, 0, 2, 3, 0],
      [0, 2, 3, 1, 0, 1, 2],
      [1, 3, 0, 2, 1, 0, 1],
    ],
  },
  {
    label: '7월',
    days: 18,
    streak: 5,
    grass: [
      [0, 1, 2, 0, 3, 1, 0],
      [1, 2, 0, 1, 0, 2, 3],
      [0, 3, 1, 2, 1, 0, 1],
      [2, 0, 0, 3, 2, 1, 0],
    ],
  },
]

// 약한 개념 — 과목별 분리 (왼쪽 영어 / 오른쪽 수학)
const WEAK_ENG = [
  { concept: '가정법 과거완료', count: 3, to: '/flashcard' },
  { concept: '다의어 (sound 등)', count: 2, to: '/flashcard' },
]
const WEAK_MATH = [
  { concept: '이차방정식 인수분해', count: 5, to: '/math-answer' },
  { concept: '삼각함수 그래프', count: 3, to: '/math-answer' },
]

// 일일 학습 시간 주간 막대 (F-10) — 과목별 분: 수학(파랑)+영어(초록) 누적, study_log.duration_ms 집계 대용
const WEEK = [
  { day: '월', eng: 24, math: 18 },
  { day: '화', eng: 30, math: 38 },
  { day: '수', eng: 12, math: 18 },
  { day: '목', eng: 34, math: 50 },
  { day: '금', eng: 30, math: 26 },
  { day: '토', eng: 14, math: 8 },
  { day: '일', eng: 46, math: 54, today: true },
]
const WEEK_MAX = Math.max(...WEEK.map((d) => d.eng + d.math))

/** 학습 리포트 (F-10) — 13 리포트 */
export function ReportPage() {
  const navigate = useNavigate()
  const [scope, setScope] = useState<Scope>('MONTH')
  const [monthIdx, setMonthIdx] = useState(MONTHS.length - 1)
  const s = SUBJECT[scope]
  const m = MONTHS[monthIdx]
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {scope === 'TODAY' ? '오늘' : '이번 달'} 과목별 학습 비중
            </span>
            <Segmented
              options={[
                { key: 'TODAY', label: '오늘' },
                { key: 'MONTH', label: '이번 달' },
              ]}
              value={scope}
              onChange={(k) => setScope(k as Scope)}
            />
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Donut total={s.total} mathPct={s.mathPct} />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <LegendRow color="var(--blue-500)" subject="수학" pct={s.math.pct} pctColor="var(--blue-500)" detail={s.math.detail} />
              <LegendRow color="var(--teal-500)" subject="영어" pct={s.eng.pct} pctColor="var(--teal-500)" detail={s.eng.detail} />
            </div>
          </div>
          <span style={{ fontSize: 11, color: 'var(--grey-500)' }}>{s.caption}</span>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>학습 잔디</span>
              <MonthNav
                label={m.label}
                canPrev={monthIdx > 0}
                canNext={monthIdx < MONTHS.length - 1}
                onPrev={() => setMonthIdx((i) => Math.max(0, i - 1))}
                onNext={() => setMonthIdx((i) => Math.min(MONTHS.length - 1, i + 1))}
              />
            </div>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>
              학습일 {m.days}일 · 연속 {m.streak}일 🔥
            </span>
          </div>
          {/* 좌: 잔디 그리드 + 색 범례 / 우: 설명 */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 18px)', gap: 8 }}>
                {m.grass.flat().map((lvl, i) => (
                  <span key={i} style={{ width: 18, height: 18, borderRadius: 5, background: GRASS_COLOR[lvl] }} />
                ))}
              </div>
              {/* 색 범례 (적음→많음) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>적음</span>
                {GRASS_COLOR.map((c, i) => (
                  <span key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c }} aria-hidden />
                ))}
                <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>많음</span>
              </div>
            </div>
            {/* 학습 잔디 설명 (무엇을 뜻하는지) — 잔디 오른쪽 */}
            <span
              style={{
                flex: 1,
                fontSize: 11,
                lineHeight: 1.6,
                color: 'var(--grey-500)',
                background: 'var(--color-bg-secondary)',
                borderRadius: 10,
                padding: '10px 12px',
              }}
            >
              매일의 학습 기록이 초록색으로 채워져요. 그날 활동량이 많을수록 색이 더 짙어져 꾸준함을 한눈에 볼 수 있어요.
            </span>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>일일 학습 시간</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <SubjectDot color="var(--blue-500)" label="수학" />
                <SubjectDot color="var(--teal-500)" label="영어" />
              </span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>평균 세션 24분</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 10, height: 96 }}>
            {WEEK.map((d) => {
              const total = d.eng + d.math
              const hPct = (total / WEEK_MAX) * 100
              return (
                <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    {/* 수학(파랑) 위 + 영어(초록) 아래 누적 */}
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 22,
                        height: `${hPct}%`,
                        minHeight: 6,
                        borderRadius: 4,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div style={{ height: `${(d.math / total) * 100}%`, background: 'var(--blue-500)' }} />
                      <div style={{ height: `${(d.eng / total) * 100}%`, background: 'var(--teal-500)' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: d.today ? 'var(--color-text-brand)' : 'var(--color-text-tertiary)' }}>
                    {d.day}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>지난달보다</span>
          <div style={{ display: 'flex', gap: 24 }}>
            <GrowthItem label="외운 단어" value="24" delta="+8" up />
            <GrowthItem label="정답률" value="78%" delta="-3%p" up={false} />
            <GrowthItem label="학습일" value="18일" delta="+3" up />
          </div>
        </Card>

        <Card>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>
            나의 약한 개념
          </span>
          {/* 왼쪽 영어 / 오른쪽 수학 */}
          <div style={{ display: 'flex', gap: 14 }}>
            <WeakColumn title="영어" color="var(--teal-500)" items={WEAK_ENG} onPick={navigate} />
            <div style={{ width: 1, background: 'var(--color-border-default)', alignSelf: 'stretch' }} aria-hidden />
            <WeakColumn title="수학" color="var(--blue-500)" items={WEAK_MATH} onPick={navigate} />
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

function Donut({ total, mathPct }: { total: string; mathPct: number }) {
  return (
    <div
      style={{
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: `conic-gradient(var(--blue-500) 0% ${mathPct}%, var(--teal-500) ${mathPct}% 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'background 200ms ease',
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
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{total}</span>
        <span style={{ fontSize: 9, color: 'var(--color-text-tertiary)' }}>총 학습</span>
      </div>
    </div>
  )
}

// 오늘 / 이번 달 세그먼트 토글
function Segmented({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string }[]
  value: string
  onChange: (key: string) => void
}) {
  return (
    <div style={{ display: 'inline-flex', gap: 2, padding: 2, borderRadius: 999, background: 'var(--color-bg-secondary)' }}>
      {options.map((o) => {
        const active = o.key === value
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            style={{
              padding: '4px 10px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 700,
              background: active ? 'var(--color-brand-primary)' : 'transparent',
              color: active ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
              transition: 'background 140ms ease, color 140ms ease',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// 월 선택 ‹ 7월 › — 월별 학습 잔디 전환
function MonthNav({
  label,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: {
  label: string
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
}) {
  const arrow = (glyph: string, enabled: boolean, onClick: () => void, aria: string) => (
    <button
      type="button"
      disabled={!enabled}
      onClick={onClick}
      aria-label={aria}
      style={{
        width: 20,
        height: 20,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        border: 'none',
        background: 'none',
        fontSize: 15,
        fontWeight: 700,
        cursor: enabled ? 'pointer' : 'default',
        color: enabled ? 'var(--color-text-brand)' : 'var(--color-text-tertiary)',
        opacity: enabled ? 1 : 0.4,
      }}
    >
      {glyph}
    </button>
  )
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {arrow('‹', canPrev, onPrev, '이전 달')}
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', minWidth: 26, textAlign: 'center' }}>
        {label}
      </span>
      {arrow('›', canNext, onNext, '다음 달')}
    </span>
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

// 지난달 대비 증감 — 상승 초록 ▲ / 하락 빨강 ▼
function GrowthItem({ label, value, delta, up }: { label: string; value: string; delta: string; up: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{label}</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>{value}</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: up ? '#0a8a55' : 'var(--color-danger-primary)',
            background: up ? 'var(--color-success-weak)' : 'var(--color-danger-weak)',
            borderRadius: 'var(--radius-full)',
            padding: '2px 6px',
          }}
        >
          {up ? '▲' : '▼'} {delta}
        </span>
      </div>
    </div>
  )
}

// 일일 학습 시간 범례 점 (수학/영어)
function SubjectDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--color-text-tertiary)' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} aria-hidden />
      {label}
    </span>
  )
}

// 약한 개념 과목 열 (영어/수학)
function WeakColumn({
  title,
  color,
  items,
  onPick,
}: {
  title: string
  color: string
  items: { concept: string; count: number; to: string }[]
  onPick: (to: string) => void
}) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{title}</span>
      {items.map((w, i) => (
        <button
          key={w.concept}
          type="button"
          onClick={() => onPick(w.to)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            width: '100%',
            padding: 0,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color, width: 10, flexShrink: 0 }}>{i + 1}</span>
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 12,
              color: 'var(--color-text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {w.concept}
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', flexShrink: 0 }}>{w.count}회</span>
        </button>
      ))}
    </div>
  )
}
