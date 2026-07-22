import { Badge } from '@/shared/ui'
import type { MathProblem } from '../model/types'

// 문제 카드 (76:509 full / 79:606 slim). LaTeX 는 skeleton 바로 대체(추후 KaTeX 렌더).
export function MathProblemCard({ problem, slim = false }: { problem: MathProblem; slim?: boolean }) {
  if (slim) {
    return (
      <div
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 14,
          padding: '14px 16px',
        }}
      >
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {problem.title}
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'var(--color-bg-primary)',
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          background: 'var(--color-bg-secondary)',
          borderRadius: 8,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <p style={{ margin: 0, fontSize: 18, fontWeight: 500, color: 'var(--color-text-primary)' }}>
          {problem.title}
        </p>
        <div style={{ height: 7, width: '80%', borderRadius: 3.5, background: 'var(--grey-300)' }} />
        <div style={{ height: 7, width: '55%', borderRadius: 3.5, background: 'var(--grey-300)' }} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {problem.tags.map((t) => (
          <Badge key={t.label} color={t.tone} variant="weak" size="md">
            {t.label}
          </Badge>
        ))}
        {problem.wrongCount !== undefined && (
          <Badge color="red" variant="weak" size="md">
            몰라요 {problem.wrongCount}회
          </Badge>
        )}
      </div>
    </div>
  )
}
