import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchReportSummary } from '@/entities/report'
import type { ReportSubject } from '@/entities/report'

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

// "24장" / "78%" 의 앞 숫자를 카운트업하고 접미사는 유지
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

// mount 기반 순차 등장 스타일
function entrance(mounted: boolean, delay: number): CSSProperties {
  return {
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(12px)',
    transition: `opacity 0.5s ease-out ${delay}s, transform 0.5s ease-out ${delay}s`,
  }
}

// 학습 잔디 색 강도 — level 0~4 (백엔드 통일 임계)
const GRASS_COLOR = ['var(--color-bg-secondary)', '#b8ecd4', '#7ee2b0', '#4fd89e', 'var(--color-success-primary)']

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']

// 분 → "Xh Ym" / "N분"
function fmtMin(m: number): string {
  if (m <= 0) return '0분'
  const h = Math.floor(m / 60)
  const min = m % 60
  return h > 0 ? `${h}h ${min}m` : `${min}분`
}

/** 학습 리포트 (F-10) — 13 리포트. GET /api/reports/summary 실연동 */
export function ReportPage() {
  const navigate = useNavigate()

  // 이번 달(YYYY-MM). period=YYYY-MM 만 허용(WEEK/MONTH 는 400)
  const today = new Date()
  const period = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`
  const report = useQuery({ queryKey: ['report-summary', period], queryFn: () => fetchReportSummary(period) })
  const basic = report.data?.basic
  const full = report.data?.full ?? null
  const grass = report.data?.grass ?? []

  // 통계 카드
  const newCards = `${basic?.newCards ?? 0}장`
  const accWord = basic?.accuracy.word != null ? `${Math.round(basic.accuracy.word * 100)}%` : '—'
  const accMath = basic?.accuracy.problem != null ? `${Math.round(basic.accuracy.problem * 100)}%` : '—'

  // 과목별 학습 비중(도넛)
  const breakdown = basic?.subjectBreakdown ?? []
  const mathB = breakdown.find((b) => b.subject === 'MATH')
  const engB = breakdown.find((b) => b.subject === 'ENGLISH')
  const totalMin = breakdown.reduce((a, b) => a + b.minutes, 0)
  const mathPct = Math.round((mathB?.ratio ?? 0) * 100)
  const engPct = Math.round((engB?.ratio ?? 0) * 100)

  // 잔디 — 이번 달 날짜별 level. 총 학습분
  const grassByDate = new Map(grass.map((g) => [g.date, g]))
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const monthLevels = Array.from({ length: daysInMonth }, (_, i) => {
    const key = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(i + 1)}`
    return grassByDate.get(key)?.level ?? 0
  })
  const totalStudyMin = grass.reduce((a, g) => a + g.minutes, 0)
  const activeDays = grass.filter((g) => g.count > 0).length

  // 일일 학습시간(최근 7일, 일별 총 분 — 과목별 분해는 백엔드 미제공)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    return { label: WEEKDAY[d.getDay()], minutes: grassByDate.get(ymd(d))?.minutes ?? 0, today: i === 6 }
  })
  const maxMin = Math.max(60, ...last7.map((x) => x.minutes))
  const avgMin = Math.round(basic?.rhythm.avgSessionMinutes ?? 0)

  // 약한 개념(프리미엄) — 과목별 분리
  const weakEng = (full?.weakConcepts ?? []).filter((w) => w.subject === 'ENGLISH')
  const weakMath = (full?.weakConcepts ?? []).filter((w) => w.subject === 'MATH')

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const monthLabel = `${today.getMonth() + 1}월`

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'var(--color-bg-primary)', padding: '24px var(--spacing-xl) 16px' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>{monthLabel} 리포트</h1>
        <p style={{ margin: '4px 0 0', fontSize: 15, color: 'var(--color-text-secondary)' }}>
          이번 달 학습 요약 — 프리미엄 리포트
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px var(--spacing-xl) 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9, ...entrance(mounted, 0) }}>
          <StatCard label="새로 만든 카드" value={newCards} />
          <StatCard label="영어 정답률" value={accWord} accent />
          <StatCard label="수학 정답률" value={accMath} accent />
        </div>

        {/* 과목별 학습 비중 도넛 */}
        <Card style={entrance(mounted, 0.12)}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>이번 달 과목별 학습 비중</span>
          {totalMin > 0 ? (
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'center' }}>
              <Donut total={fmtMin(totalMin)} mathPct={mathPct} />
              <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <LegendRow color="var(--blue-500)" subject="수학" pct={`${mathPct}%`} pctColor="var(--blue-500)" detail={`${mathB?.minutes ?? 0}분 · ${mathB?.count ?? 0}문제`} />
                <LegendRow color="var(--teal-500)" subject="영어" pct={`${engPct}%`} pctColor="var(--teal-500)" detail={`${engB?.minutes ?? 0}분 · ${engB?.count ?? 0}단어`} />
              </div>
            </div>
          ) : (
            <EmptyRow text="이번 달 학습 기록이 아직 없어요" />
          )}
        </Card>

        {/* 학습 잔디 */}
        <Card style={entrance(mounted, 0.18)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>학습 잔디 · {monthLabel}</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>
              총 {fmtMin(totalStudyMin)} · {activeDays}일 학습 🔥
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 34px)', gap: 6 }}>
              {monthLevels.map((lvl, i) => (
                <span
                  key={i}
                  title={`${i + 1}일`}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: GRASS_COLOR[Math.min(lvl, 4)],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    color: 'var(--color-text-tertiary)',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'scale(1)' : 'scale(0.3)',
                    transition: `opacity 0.3s ease-out ${0.28 + i * 0.012}s, transform 0.3s ease-out ${0.28 + i * 0.012}s`,
                  }}
                >
                  {i + 1}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>적게</span>
              {GRASS_COLOR.map((c, i) => (
                <span key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c }} aria-hidden />
              ))}
              <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>많이 (학습 시간)</span>
            </div>
          </div>
        </Card>

        {/* 일일 학습 시간(최근 7일 · 일별 총 분) */}
        <Card style={entrance(mounted, 0.24)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>일일 학습 시간</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>평균 세션 {avgMin}분</span>
          </div>
          <div style={{ position: 'relative', height: 120 }}>
            <div style={{ position: 'absolute', left: 0, right: 30, top: 0, bottom: 0, display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              {last7.map((d, di) => {
                const hPct = (d.minutes / maxMin) * 100
                return (
                  <div key={di} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 22,
                        height: mounted ? `${hPct}%` : '0%',
                        minHeight: mounted && d.minutes > 0 ? 4 : 0,
                        borderRadius: 4,
                        background: d.today ? 'var(--color-brand-primary)' : 'var(--blue-500)',
                        transition: `height 0.6s cubic-bezier(0.2, 0.8, 0.3, 1) ${0.28 + di * 0.05}s`,
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginRight: 30 }}>
            {last7.map((d, i) => (
              <span
                key={i}
                style={{ flex: 1, textAlign: 'center', fontSize: 10, color: d.today ? 'var(--color-text-brand)' : 'var(--color-text-tertiary)' }}
              >
                {d.label}
              </span>
            ))}
          </div>
        </Card>

        {/* 나의 약한 개념 (프리미엄) */}
        <Card style={entrance(mounted, 0.3)}>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>나의 약한 개념</span>
          {full == null ? (
            <EmptyRow text="🔒 프리미엄에서 약한 개념 분석을 볼 수 있어요" />
          ) : weakEng.length === 0 && weakMath.length === 0 ? (
            <EmptyRow text="아직 약한 개념이 없어요 — 잘하고 있어요!" />
          ) : (
            <div style={{ display: 'flex', gap: 14 }}>
              <WeakColumn title="영어" color="var(--teal-500)" items={weakEng} onPick={() => navigate('/flashcard')} />
              <div style={{ width: 1, background: 'var(--color-border-default)', alignSelf: 'stretch' }} aria-hidden />
              <WeakColumn title="수학" color="var(--blue-500)" items={weakMath} onPick={() => navigate('/math-review')} />
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function EmptyRow({ text }: { text: string }) {
  return (
    <p style={{ margin: '12px 0', textAlign: 'center', fontSize: 13, color: 'var(--color-text-tertiary)' }}>{text}</p>
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

// 약한 개념 과목 열 (영어/수학)
function WeakColumn({
  title,
  color,
  items,
  onPick,
}: {
  title: string
  color: string
  items: { concept: string; subject: ReportSubject; wrongCount: number }[]
  onPick: () => void
}) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{title}</span>
      {items.length === 0 && <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>없음</span>}
      {items.map((w, i) => (
        <button
          key={w.concept + i}
          type="button"
          onClick={onPick}
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
          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', flexShrink: 0 }}>{w.wrongCount}회</span>
        </button>
      ))}
    </div>
  )
}
