interface Props {
  correct: boolean
  answerValue: string
  explanation: string
  enteredAnswer: string
  // 다른 풀이 — 접근법 라벨(첫 번째=현재), 생성 버튼 콜백(프리미엄)
  solutionLabels?: string[]
  onGenerateSolution?: () => void
  generating?: boolean
  genError?: string | null
}

const cardStyle = {
  background: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-border-default)',
  borderRadius: 14,
  padding: '14px 16px',
} as const

// 판정 결과 (12-4 정답 / 12-5 오답) — 피드백 + 정답 + 해설 + 다른 풀이
export function VerdictView({
  correct,
  answerValue,
  explanation,
  enteredAnswer,
  solutionLabels,
  onGenerateSolution,
  generating,
  genError,
}: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderRadius: 14,
          padding: '14px 16px',
          background: correct ? 'var(--color-success-weak)' : 'var(--color-danger-weak)',
          color: correct ? 'var(--color-success-primary)' : 'var(--color-text-danger)',
          // 정답 시 토스식 스프링 팝, 오답은 부드러운 등장
          animation: correct
            ? 'jjik-pop-spring 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.2) both'
            : 'jjik-rise-in 0.4s ease-out both',
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700 }}>
          {correct ? '🎉 정답이에요!' : '아쉬워요, 다시 확인해봐요'}
        </span>
        {correct && <span style={{ fontSize: 12, fontWeight: 700 }}>+15 XP</span>}
      </div>

      {!correct && (
        <div style={cardStyle}>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)' }}>
            내가 쓴 답
          </p>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--color-text-danger)' }}>
            {enteredAnswer || '—'}
          </p>
        </div>
      )}

      <div style={cardStyle}>
        <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)' }}>
          정답
        </p>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {answerValue}
        </p>
      </div>

      <div style={cardStyle}>
        <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)' }}>
          해설
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
          {explanation}
        </p>
      </div>

      <OtherSolutions
        labels={solutionLabels ?? []}
        onGenerate={onGenerateSolution}
        generating={generating}
        genError={genError}
      />
    </div>
  )
}

// 다른 풀이 (118:771, F-26 v1.8) — 생성된 접근법 라벨 + 프리미엄 생성 버튼
function OtherSolutions({
  labels,
  onGenerate,
  generating,
  genError,
}: {
  labels: string[]
  onGenerate?: () => void
  generating?: boolean
  genError?: string | null
}) {
  return (
    <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)' }}>
        다른 풀이 — 수학은 접근이 여러 가지예요
      </span>
      {labels.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {labels.map((l, i) => (
            <span
              key={l + i}
              style={{
                fontSize: 12,
                fontWeight: i === 0 ? 700 : 500,
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                background: i === 0 ? 'var(--color-brand-primary)' : 'var(--color-brand-weak)',
                color: i === 0 ? 'var(--color-text-inverse)' : 'var(--color-text-brand)',
              }}
            >
              {l}
            </span>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={onGenerate}
        disabled={generating}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          width: '100%',
          padding: '12px 0',
          borderRadius: 12,
          border: 'none',
          background: 'var(--color-brand-weak)',
          cursor: generating ? 'default' : 'pointer',
          opacity: generating ? 0.6 : 1,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-brand-primary)' }}>
          {generating ? '생성 중…' : '✨ 다른 풀이 보기'}
        </span>
        <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--grey-500)' }}>프리미엄</span>
      </button>
      {genError && (
        <span style={{ fontSize: 12, textAlign: 'center', color: 'var(--color-text-danger)' }}>{genError}</span>
      )}
    </div>
  )
}
