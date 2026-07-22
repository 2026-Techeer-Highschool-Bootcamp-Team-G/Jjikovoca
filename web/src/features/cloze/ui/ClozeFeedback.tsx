import type { ClozeQuestion } from '../model/types'

interface Props {
  question: ClozeQuestion
  correct: boolean
}

// 판정 피드백 (36:255 / 185:988) — 정답: 초록+XP / 오답: 빨강+정답 안내 (v1.6)
export function ClozeFeedback({ question, correct }: Props) {
  return (
    <div
      style={{
        background: correct ? 'var(--color-success-weak)' : 'var(--color-danger-weak)',
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: correct ? '#0a8a55' : '#c22c3a' }}>
          {correct ? '✓ 정답이에요!' : `✕ 아쉬워요, 정답은 ${question.answer}예요`}
        </span>
        {correct && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--color-text-inverse)',
              background: 'var(--color-success-primary)',
              borderRadius: 'var(--radius-full)',
              padding: '2px 8px',
            }}
          >
            +10 XP
          </span>
        )}
      </div>
      <div style={{ fontSize: 12, lineHeight: '18px', color: 'var(--color-text-secondary)' }}>
        <div>{question.wordPhrase}</div>
        <div>{correct ? question.correctNote : question.wrongNote}</div>
      </div>
    </div>
  )
}
