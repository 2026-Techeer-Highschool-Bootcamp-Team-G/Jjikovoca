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

// 학습 잔디 색 강도 — level 0~4. GitHub식 초록 스케일(적게→많이)
const GRASS_COLOR = ['var(--color-bg-secondary)', '#9be9a8', '#40c463', '#30a14e', '#216e39']

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
  const newCards = `${basic?.newCards ?? 0}개`
  const accWord = basic?.accuracy.word != null ? `${Math.round(basic.accuracy.word * 100)}%` : '—'

  // 잔디 — 이번 달 날짜별 level. 총 학습분
  const grassByDate = new Map(grass.map((g) => [g.date, g]))
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const monthLevels = Array.from({ length: daysInMonth }, (_, i) => {
    const key = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(i + 1)}`
    return grassByDate.get(key)?.level ?? 0
  })
  // 이번 달 1일의 요일(0=일~6=토) — 그 수만큼 그리드 앞에 빈 칸을 넣어 날짜를 실제 요일 열에 맞춘다
  const firstWeekday = new Date(today.getFullYear(), today.getMonth(), 1).getDay()
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

  // 약한 개념(프리미엄) — 영어 전용
  const weakEng = (full?.weakConcepts ?? []).filter((w) => w.subject === 'ENGLISH')

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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, ...entrance(mounted, 0) }}>
          <StatCard label="새로 추가한 단어" value={newCards} />
          <StatCard label="단어 정답률" value={accWord} accent />
        </div>

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
              {/* 요일 헤더 — 일요일 시작(WEEKDAY 순서와 동일) */}
              {WEEKDAY.map((w) => (
                <span key={`wd-${w}`} style={{ width: 34, textAlign: 'center', fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)' }}>
                  {w}
                </span>
              ))}
              {/* 월 시작 요일 오프셋 — 1일이 실제 요일 열에서 시작하도록 빈 칸 */}
              {Array.from({ length: firstWeekday }, (_, i) => (
                <span key={`off-${i}`} style={{ width: 34, height: 34 }} aria-hidden />
              ))}
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
          ) : weakEng.length === 0 ? (
            <EmptyRow text="아직 약한 개념이 없어요 — 잘하고 있어요!" />
          ) : (
            <WeakColumn title="영어" color="var(--teal-500)" items={weakEng} onPick={() => navigate('/flashcard')} />
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
