import type { ClozeQuestion } from '../model/types'

interface Props {
  question: ClozeQuestion
  graded: boolean
  correct: boolean
}

// 빈칸 문장 카드 (29:242) — 채점 후 빈칸에 정답이 채워지고 색으로 정오 표시
export function ClozeCard({ question, graded, correct }: Props) {
  return (
    <div
      style={{
        background: 'var(--color-bg-elevated)',
        borderRadius: 20,
        boxShadow: 'var(--shadow-card)',
        padding: 20,
        minHeight: 150,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <p style={{ margin: 0, fontSize: 16, fontWeight: 500, lineHeight: '25px', color: 'var(--color-text-primary)' }}>
        {question.pre}
        {graded ? (
          <b style={{ color: correct ? 'var(--color-success-primary)' : 'var(--color-text-danger)' }}>
            {question.answer}
          </b>
        ) : (
          <span style={{ color: 'var(--color-text-tertiary)', letterSpacing: 1 }}>______</span>
        )}
        {question.post}
      </p>
      <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
        {graded ? question.translationFilled : question.translationBlank}
      </span>
    </div>
  )
}
