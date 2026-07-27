import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, BottomSheet, SuccessGraphic } from '@/shared/ui'
import type { GameResultItem, GameResultState } from '@/features/game-result'

const GRADIENT = 'linear-gradient(180deg, var(--color-brand-weak) 0%, var(--color-bg-primary) 45%)'

// grade 3분류 카운트
function gradeCounts(items: GameResultItem[]) {
  return {
    KNOW: items.filter((i) => i.grade === 'KNOW').length,
    CONFUSED: items.filter((i) => i.grade === 'CONFUSED').length,
    DONT_KNOW: items.filter((i) => i.grade === 'DONT_KNOW').length,
  }
}

// 0 → target 카운트업(easeOutCubic). 진입 시 경험치가 차오르는 인터랙션
function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (target <= 0) {
      setVal(0)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return val
}

/** 게임 엔딩(결과 종합) — 플래시카드·빈칸퀴즈 공용. XP 카운트업·축하 폭죽·도넛 통계·범위별 재학습 */
export function GameResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as GameResultState | null
  const [retryOpen, setRetryOpen] = useState(false)

  // 직접 진입(새로고침 등)으로 세션이 없으면 단어장으로
  if (!state) {
    navigate('/wrong-note', { replace: true })
    return null
  }

  const { type, items, totalXp, levelUp } = state
  const total = items.length
  const counts = gradeCounts(items)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: GRADIENT, overflow: 'hidden' }}>
      <Confetti />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: '44px 24px 0', position: 'relative', zIndex: 1 }}>
        {levelUp ? <SuccessGraphic /> : <span style={{ fontSize: 52, animation: 'jjik-pop-spring 0.6s cubic-bezier(0.2,0.9,0.3,1.2) both' }} aria-hidden>🎉</span>}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>학습 완료!</h1>
          {levelUp && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: 'var(--color-on-accent)',
                background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-strong))',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                boxShadow: '0 4px 12px rgba(245,182,56,0.4)',
              }}
            >
              ⚡ 레벨 업!
            </span>
          )}
        </div>

        <XpSummary totalXp={totalXp} />

        {/* 통계 카드 */}
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            padding: '20px 18px',
            borderRadius: 16,
            background: 'var(--color-bg-elevated)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {type === 'CLOZE' && <ClozeAccuracy items={items} />}
          <GradeDonut counts={counts} total={total} />
        </div>
      </div>

      {/* 하단 버튼 */}
      <div style={{ background: 'var(--color-bg-primary)', padding: '16px var(--spacing-xl) 32px', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', zIndex: 1 }}>
        <Button block size="lg" onClick={() => setRetryOpen(true)}>
          다시 학습하기
        </Button>
        <Button block size="lg" variant="weak" onClick={() => navigate('/wrong-note')}>
          단어장으로 가기
        </Button>
      </div>

      <RetryScopeSheet open={retryOpen} onClose={() => setRetryOpen(false)} state={state} />
    </div>
  )
}

// 경험치 요약 — 0부터 차오르는 카운트업 + gold 그라디언트
function XpSummary({ totalXp }: { totalXp: number }) {
  const shown = useCountUp(totalXp)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        padding: '16px 32px',
        borderRadius: 16,
        background: 'var(--color-bg-elevated)',
        boxShadow: 'var(--shadow-card)',
        animation: 'jjik-pop-spring 0.5s cubic-bezier(0.2,0.9,0.3,1.2) 0.1s both',
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)' }}>획득 경험치</span>
      <span
        style={{
          fontSize: 34,
          fontWeight: 800,
          lineHeight: 1.1,
          background: 'linear-gradient(135deg, var(--color-accent-strong), var(--color-accent))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        +{shown} XP
      </span>
    </div>
  )
}

// 빈칸 정답률 — 맞춘/틀린 + %
function ClozeAccuracy({ items }: { items: GameResultItem[] }) {
  const total = items.length
  const correct = items.filter((i) => i.correct).length
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 12, borderBottom: '1px solid var(--color-border-default)' }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
        정답 {correct} · 오답 {total - correct}
      </span>
      <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-brand-primary)' }}>정답률 {pct}%</span>
    </div>
  )
}

// 알아요/헷갈려요/몰라요 도넛 차트 + 범례 (GradeButtons 색과 통일)
function GradeDonut({ counts, total }: { counts: { KNOW: number; CONFUSED: number; DONT_KNOW: number }; total: number }) {
  const R = 52
  const SW = 20
  const C = 2 * Math.PI * R
  const segs = [
    { key: 'KNOW', label: '알아요', n: counts.KNOW, color: 'var(--color-brand-primary)' },
    { key: 'CONFUSED', label: '헷갈려요', n: counts.CONFUSED, color: 'var(--color-accent-strong)' },
    { key: 'DONT_KNOW', label: '몰라요', n: counts.DONT_KNOW, color: 'var(--color-danger-primary)' },
  ]
  let acc = 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={140} height={140} viewBox="0 0 140 140" style={{ flexShrink: 0, animation: 'jjik-pop-spring 0.6s cubic-bezier(0.2,0.9,0.3,1.2) 0.2s both' }}>
        {/* 배경 트랙 */}
        <circle cx={70} cy={70} r={R} fill="none" stroke="var(--color-bg-secondary)" strokeWidth={SW} />
        {/* 세그먼트 (12시부터 시계방향) */}
        {segs.map((s) => {
          const len = total > 0 ? (s.n / total) * C : 0
          const el = (
            <circle
              key={s.key}
              cx={70}
              cy={70}
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={SW}
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-acc}
              transform="rotate(-90 70 70)"
            />
          )
          acc += len
          return el
        })}
        {/* 중앙 총 개수 */}
        <text x={70} y={66} textAnchor="middle" fontSize={28} fontWeight={800} fill="var(--color-text-primary)">
          {total}
        </text>
        <text x={70} y={88} textAnchor="middle" fontSize={12} fontWeight={500} fill="var(--color-text-tertiary)">
          문제
        </text>
      </svg>

      {/* 범례 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {segs.map((s) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} aria-hidden />
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', flex: 1 }}>{s.label}</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-primary)' }}>{s.n}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// 다시 학습 범위 선택 — [전체]/[몰라요만]/[몰라요+헷갈려요만] (두 게임 공통, 힌트 기반 grade)
function RetryScopeSheet({ open, onClose, state }: { open: boolean; onClose: () => void; state: GameResultState }) {
  const navigate = useNavigate()
  const { type, items } = state
  const ranges = [
    { key: 'ALL', label: '전체', ids: items.map((i) => i.cardId) },
    { key: 'DK', label: '몰라요만', ids: items.filter((i) => i.grade === 'DONT_KNOW').map((i) => i.cardId) },
    { key: 'DKC', label: '몰라요 + 헷갈려요만', ids: items.filter((i) => i.grade !== 'KNOW').map((i) => i.cardId) },
  ]
  const restart = (ids: number[]) => {
    if (ids.length === 0) return
    navigate(type === 'CLOZE' ? '/cloze' : '/flashcard', { state: { cardIds: ids } })
  }
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 4 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>다시 학습할 범위</span>
        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>방금 학습한 단어 중에서 골라 다시 풀어요</span>
      </div>
      {ranges.map((r) => (
        <Button
          key={r.key}
          block
          size="lg"
          variant={r.key === 'ALL' ? 'primary' : 'weak'}
          disabled={r.ids.length === 0}
          style={{ opacity: r.ids.length === 0 ? 0.4 : 1 }}
          onClick={() => restart(r.ids)}
        >
          {r.label} ({r.ids.length})
        </Button>
      ))}
    </BottomSheet>
  )
}

// 축하 폭죽 — 화면 상단 중앙에서 사방으로 튀는 조각(기존 jjik-confetti-burst 재사용). 결정적 각도 배치
const CONFETTI = Array.from({ length: 26 }, (_, i) => {
  const angle = (i / 26) * Math.PI * 2
  const dist = 130 + (i % 4) * 48
  const palette = ['var(--color-brand-primary)', '#f5a623', '#1bc1bd', '#e5484d', 'var(--color-accent-strong)']
  return {
    tx: `${Math.round(Math.cos(angle) * dist)}px`,
    ty: `${Math.round(Math.sin(angle) * dist)}px`,
    r: `${(i % 2 ? 1 : -1) * (120 + i * 14)}deg`,
    c: palette[i % palette.length],
    d: `${(i % 6) * 0.05}s`,
    shape: i % 3 === 0 ? '50%' : '2px',
  }
})

function Confetti() {
  return (
    <div style={{ position: 'fixed', top: '20%', left: '50%', width: 0, height: 0, pointerEvents: 'none', zIndex: 40 }} aria-hidden>
      {CONFETTI.map((p, i) => (
        <span
          key={i}
          style={
            {
              position: 'absolute',
              width: 9,
              height: 9,
              borderRadius: p.shape,
              background: p.c,
              '--tx': p.tx,
              '--ty': p.ty,
              '--r': p.r,
              animation: `jjik-confetti-burst 1.4s ease-out ${p.d} both`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
