import type { ReactNode } from 'react'

// 학습 잔디 4주 × 7일 (136:1068) — 레벨 0~3 색상. 0=빈칸 / 3=진함
const GRASS: number[][] = [
  [0, 1, 2, 0, 3, 1, 0],
  [1, 2, 0, 1, 0, 2, 3],
  [0, 3, 1, 2, 1, 0, 1],
  [2, 0, 0, 3, 2, 1, 0],
]
const GRASS_COLOR = ['var(--color-bg-secondary)', '#b8ecd4', '#4fd89e', 'var(--color-success-primary)']

const WEAK = [
  { concept: '이차방정식 인수분해', ratio: 1, count: 5 },
  { concept: '가정법 과거완료', ratio: 0.6, count: 3 },
  { concept: '다의어 (sound 등)', ratio: 0.4, count: 2 },
]

/** 학습 리포트 — 스크롤 내린 화면 (13, F-10). 과목별 비중·잔디·성장·약점 카드 */
export function ReportScrollPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--color-bg-secondary)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px var(--spacing-xl) 24px' }}>
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
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>이번 달 학습일 18일</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 18px)', gap: 8 }}>
            {GRASS.flat().map((lvl, i) => (
              <span key={i} style={{ width: 18, height: 18, borderRadius: 5, background: GRASS_COLOR[lvl] }} />
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
              <div key={w.concept} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
              </div>
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
