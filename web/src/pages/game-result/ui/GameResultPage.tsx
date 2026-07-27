import { useState } from 'react'
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

/** 게임 엔딩(결과 종합) — 플래시카드·빈칸퀴즈 공용. XP·통계·범위별 재학습 */
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: GRADIENT }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: '48px 24px 0' }}>
        {levelUp ? <SuccessGraphic /> : <span style={{ fontSize: 52 }} aria-hidden>🎉</span>}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            학습 완료!
          </h1>
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

        {/* XP 요약 */}
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
            +{totalXp} XP
          </span>
        </div>

        {/* 통계 카드 */}
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: '18px 18px',
            borderRadius: 16,
            background: 'var(--color-bg-elevated)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {type === 'CLOZE' && <ClozeAccuracy items={items} />}
          <GradeBar counts={counts} total={total} />
        </div>
      </div>

      {/* 하단 버튼 */}
      <div style={{ background: 'var(--color-bg-primary)', padding: '16px var(--spacing-xl) 32px', display: 'flex', flexDirection: 'column', gap: 8 }}>
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

// 알아요/헷갈려요/몰라요 세그먼트 바 + 라벨(GradeButtons 색과 통일)
function GradeBar({ counts, total }: { counts: { KNOW: number; CONFUSED: number; DONT_KNOW: number }; total: number }) {
  const rows = [
    { key: 'KNOW', label: '알아요', n: counts.KNOW, color: 'var(--color-brand-primary)' },
    { key: 'CONFUSED', label: '헷갈려요', n: counts.CONFUSED, color: 'var(--color-accent-strong)' },
    { key: 'DONT_KNOW', label: '몰라요', n: counts.DONT_KNOW, color: 'var(--color-danger-primary)' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 비율 바 */}
      <div style={{ display: 'flex', height: 10, borderRadius: 'var(--radius-full)', overflow: 'hidden', background: 'var(--color-bg-secondary)' }}>
        {rows.map((r) => (
          <div key={r.key} style={{ width: total > 0 ? `${(r.n / total) * 100}%` : '0%', background: r.color }} />
        ))}
      </div>
      {/* 라벨·개수 */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {rows.map((r) => (
          <div key={r.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--color-text-secondary)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color }} aria-hidden />
              {r.label}
            </span>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)' }}>{r.n}</span>
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
