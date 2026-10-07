import React from 'react'

/** 예문 빈칸 채우기 (FR-06) — 입력 상태와 서버 판정 상태(정답·오답 뜻 공개)를 한 카드에서 다룬다 */
export function ClozeCard({ sentence = '', translation, value = '', onChange, onSubmit, judged = false, correct = false, word, meaning, hint }) {
  const [before, after] = String(sentence).split('___')
  const blankColor = judged ? (correct ? 'var(--color-result-correct)' : 'var(--color-result-wrong)') : 'var(--color-brand-primary)'
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        padding: 18,
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 20,
        boxShadow: 'var(--shadow-flashcard)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)' }}>예문</span>
      <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, color: 'var(--color-text-primary)' }}>
        {before}
        <span
          style={{
            display: 'inline-block',
            minWidth: 96,
            padding: '0 6px',
            borderBottom: '2px solid ' + blankColor,
            color: blankColor,
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          {judged ? (correct ? value : word) : value || ' '}
        </span>
        {after}
      </p>
      {translation && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>{translation}</p>}

      {!judged && (
        <>
          <input
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && onSubmit) onSubmit() }}
            placeholder="빈칸에 들어갈 단어"
            style={{
              height: 48,
              padding: '0 14px',
              background: 'var(--color-bg-secondary)',
              border: '1.5px solid transparent',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'inherit',
              fontSize: 16,
              color: 'var(--color-text-primary)',
              outline: 'none',
            }}
          />
          {hint && <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>힌트 · {hint}</span>}
        </>
      )}

      {judged && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 14, borderRadius: 'var(--radius-md)', background: correct ? 'var(--color-success-weak)' : 'var(--color-danger-weak)' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: correct ? 'var(--color-result-correct)' : 'var(--color-result-wrong)' }}>
            {correct ? '정답이에요' : '아쉬워요 — 정답은 ' + word}
          </span>
          {!correct && value && (
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>내가 쓴 답 · {value}</span>
          )}
          {meaning && (
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              <mark style={{ background: 'var(--gradient-highlighter)', color: 'inherit', padding: '0 3px', borderRadius: 3 }}>{meaning}</mark>
            </span>
          )}
        </div>
      )}
    </section>
  )
}
