import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchReportSummary } from '@/entities/report'

// 진입 시 0→목표 카운트업 (rAF, ease-out cubic)
function useCountUp(target: number, durationMs = 900): number {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      setV(target * (1 - Math.pow(1 - t, 3)))
      if (t < 1) raf = requestAnimationFrame(tick)
      else setV(target)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])
  return v
}

// "24장" / "78%" / "12개" 의 앞 숫자를 카운트업하고 접미사는 유지
function CountUp({ value }: { value: string }) {
  const match = /^(\d+)(.*)$/.exec(value)
  const target = match ? Number(match[1]) : 0
  const suffix = match ? match[2] : value
  const cur = useCountUp(target)
  if (!match) return <>{value}</>
  return (
    <>
      {Math.round(cur)}
      {suffix}
    </>
  )
}

// mount 기반 순차 등장 스타일(아래에서 떠오르며 페이드) — 전역 keyframe 불필요
function entrance(mounted: boolean, delay: number): CSSProperties {
  return {
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(12px)',
    transition: `opacity 0.5s ease-out ${delay}s, transform 0.5s ease-out ${delay}s`,
  }
}

// 백엔드 미제공 시각화 표식 — reports/summary 에 없는 데이터라 데모임을 명시(backend-requests §3)
function DemoTag() {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: '2px 6px',
        borderRadius: 6,
        background: 'var(--color-bg-secondary)',
        color: 'var(--color-text-tertiary)',
        whiteSpace: 'nowrap',
      }}
    >
      데모
    </span>
  )
}

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

// 학습 잔디 — 레벨(=학습 시간대)별 색·칸 크기. 시간이 많을수록 진하고 커진다
const GRASS_COLOR = ['var(--color-bg-secondary)', '#b8ecd4', '#4fd89e', 'var(--color-success-primary)']
const GRASS_HOURS = [0, 2, 4, 7] // 레벨 0~3 → 그날 학습 시간(h). 칸 안에 Nh 표기

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
  { concept: '이차방정식 인수분해', count: 5, to: '/math-review' },
  { concept: '삼각함수 그래프', count: 3, to: '/math-review' },
]

// 일일 학습 시간 주간 막대 (F-10) — 과목별 분(분 단위): 수학(파랑)+영어(초록) 누적
const WEEK = [
  { day: '월', eng: 90, math: 70 },
  { day: '화', eng: 130, math: 170 },
  { day: '수', eng: 60, math: 60 },
  { day: '목', eng: 150, math: 190 },
  { day: '금', eng: 100, math: 80 },
  { day: '토', eng: 40, math: 40 },
  { day: '일', eng: 140, math: 150, today: true },
]
const WEEK_TOTALS = WEEK.map((d) => d.eng + d.math)
// Y축 상한(짝수 시간) + 눈금·평균 (분 단위)
const AXIS_HOUR = Math.max(2, Math.ceil(Math.max(...WEEK_TOTALS) / 120) * 2)
const AXIS_MIN = AXIS_HOUR * 60
const WEEK_AVG_MIN = WEEK_TOTALS.reduce((a, b) => a + b, 0) / WEEK_TOTALS.length

/** 학습 리포트 (F-10) — 13 리포트 */
export function ReportPage() {
  const navigate = useNavigate()
  const [scope, setScope] = useState<Scope>('MONTH')
  const [monthIdx, setMonthIdx] = useState(MONTHS.length - 1)
  const s = SUBJECT[scope]
  const m = MONTHS[monthIdx]
  const grassHours = m.grass.flat().reduce((a, l) => a + GRASS_HOURS[l], 0) // 이번 달 총 학습 시간(h)

  // 실 API — 백엔드는 period=YYYY-MM 요구(WEEK/MONTH 는 400). 이번 달을 전달
  const period = (() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })()
  // basic(새 카드·정답률)만 백엔드 제공 → 실값. null(데이터 없음)은 가짜 대신 '—'
  // (도넛·잔디·약점·주간막대는 백엔드 필드 없음 → 클라 데모, Phase 5에서 문서화)
  const report = useQuery({ queryKey: ['report-summary', period], queryFn: () => fetchReportSummary(period) })
  const basic = report.data?.basic
  const newCards = `${basic?.newCards ?? 0}장`
  const accuracyWord = basic?.accuracy.word != null ? `${Math.round(basic.accuracy.word * 100)}%` : '—'
  const accuracyMath = basic?.accuracy.problem != null ? `${Math.round(basic.accuracy.problem * 100)}%` : '—'

  // 진입 시 카드/막대/잔디가 생성되듯 순차 등장
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9, ...entrance(mounted, 0) }}>
          <StatCard label="새로 만든 카드" value={newCards} />
          <StatCard label="영어 정답률" value={accuracyWord} accent />
          <StatCard label="수학 정답률" value={accuracyMath} accent />
        </div>

        <Card style={entrance(mounted, 0.12)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {scope === 'TODAY' ? '오늘' : '이번 달'} 과목별 학습 비중 <DemoTag />
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
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'center' }}>
            <Donut total={s.total} mathPct={s.mathPct} />
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <LegendRow color="var(--blue-500)" subject="수학" pct={s.math.pct} pctColor="var(--blue-500)" detail={s.math.detail} />
              <LegendRow color="var(--teal-500)" subject="영어" pct={s.eng.pct} pctColor="var(--teal-500)" detail={s.eng.detail} />
            </div>
          </div>
          <span style={{ fontSize: 11, color: 'var(--grey-500)' }}>{s.caption}</span>
        </Card>

        <Card style={entrance(mounted, 0.18)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>학습 잔디 <DemoTag /></span>
              <MonthNav
                label={m.label}
                canPrev={monthIdx > 0}
                canNext={monthIdx < MONTHS.length - 1}
                onPrev={() => setMonthIdx((i) => Math.max(0, i - 1))}
                onNext={() => setMonthIdx((i) => Math.min(MONTHS.length - 1, i + 1))}
              />
            </div>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>
              총 {grassHours}시간 · 연속 {m.streak}일 🔥
            </span>
          </div>
          {/* 잔디 그리드 — 균일 칸, 칸 안에 학습 시간(Nh) 표기. 가운데 정렬 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 34px)', gap: 6 }}>
              {m.grass.flat().map((lvl, i) => (
                <span
                  key={i}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: GRASS_COLOR[lvl],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    color: lvl >= 2 ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'scale(1)' : 'scale(0.3)',
                    transition: `opacity 0.3s ease-out ${0.28 + i * 0.012}s, transform 0.3s ease-out ${0.28 + i * 0.012}s`,
                  }}
                >
                  {lvl > 0 ? `${GRASS_HOURS[lvl]}h` : ''}
                </span>
              ))}
            </div>
            {/* 범례 — 색이 진할수록 오래 공부한 날 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>적게</span>
              {GRASS_COLOR.map((c, i) => (
                <span key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c }} aria-hidden />
              ))}
              <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>많이 (학습 시간)</span>
            </div>
          </div>
        </Card>

        <Card style={entrance(mounted, 0.24)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>일일 학습 시간 <DemoTag /></span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <SubjectDot color="var(--blue-500)" label="수학" />
                <SubjectDot color="var(--teal-500)" label="영어" />
              </span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>
              하루 평균 {(WEEK_AVG_MIN / 60).toFixed(1)}시간
            </span>
          </div>
          {/* Y축 시간 눈금 + 평균 점선 + 막대 */}
          <div style={{ position: 'relative', height: 120 }}>
            {/* 시간 눈금(상한·절반) */}
            {[AXIS_HOUR, AXIS_HOUR / 2].map((h) => (
              <div
                key={h}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 30,
                  bottom: `${(h / AXIS_HOUR) * 100}%`,
                  borderTop: '1px dashed var(--color-border-default)',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: 'calc(100% + 4px)',
                    top: 0,
                    transform: 'translateY(-50%)',
                    fontSize: 10,
                    color: 'var(--color-text-tertiary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}시간
                </span>
              </div>
            ))}
            {/* 평균 점선 */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 30,
                bottom: `${(WEEK_AVG_MIN / AXIS_MIN) * 100}%`,
                borderTop: '1.5px dashed #0a8a55',
                opacity: mounted ? 1 : 0,
                transition: 'opacity 0.5s ease-out 0.6s',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: 'calc(100% + 4px)',
                  top: 0,
                  transform: 'translateY(-50%)',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#0a8a55',
                  whiteSpace: 'nowrap',
                }}
              >
                평균
              </span>
            </div>
            {/* 막대 */}
            <div style={{ position: 'absolute', left: 0, right: 30, top: 0, bottom: 0, display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              {WEEK.map((d, di) => {
                const total = d.eng + d.math
                const hPct = (total / AXIS_MIN) * 100
                return (
                  <div key={d.day} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 22,
                        height: mounted ? `${hPct}%` : '0%',
                        minHeight: mounted ? 4 : 0,
                        borderRadius: 4,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: `height 0.6s cubic-bezier(0.2, 0.8, 0.3, 1) ${0.28 + di * 0.05}s`,
                      }}
                    >
                      <div style={{ height: `${(d.math / total) * 100}%`, background: 'var(--blue-500)' }} />
                      <div style={{ height: `${(d.eng / total) * 100}%`, background: 'var(--teal-500)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          {/* 요일 라벨 */}
          <div style={{ display: 'flex', gap: 10, marginRight: 30 }}>
            {WEEK.map((d) => (
              <span
                key={d.day}
                style={{ flex: 1, textAlign: 'center', fontSize: 10, color: d.today ? 'var(--color-text-brand)' : 'var(--color-text-tertiary)' }}
              >
                {d.day}
              </span>
            ))}
          </div>
        </Card>

        <Card style={entrance(mounted, 0.3)}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>
            나의 약한 개념 <DemoTag />
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

function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: 'var(--color-bg-primary)',
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        ...style,
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
        <CountUp value={value} />
      </span>
    </div>
  )
}

function Donut({ total, mathPct }: { total: string; mathPct: number }) {
  // 진입 시 0→100% 시계방향으로 채워지며 원그래프 생성 (sweep 이 도달한 각도까지만 색, 나머지는 배경)
  const sweep = useCountUp(100, 900)
  const blueEnd = Math.min(sweep, mathPct)
  return (
    <div
      style={{
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: `conic-gradient(var(--blue-500) 0% ${blueEnd}%, var(--teal-500) ${blueEnd}% ${sweep}%, var(--color-bg-secondary) ${sweep}% 100%)`,
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
          <span style={{ color: pctColor }}>
            <CountUp value={pct} />
          </span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{detail}</span>
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
