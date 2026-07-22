interface Props {
  value: string
  onChange: (v: string) => void
}

// 정답 입력 (12-3) — 숫자만·시스템 숫자 키패드(inputMode), 복수 답은 쉼표 (v2.0)
export function AnswerInput({ value, onChange }: Props) {
  return (
    <div
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 14,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)' }}>
        정답 입력
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        autoFocus
        placeholder="예: 2, 3"
        style={{
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          padding: 0,
        }}
      />
      <span style={{ fontSize: 11, color: 'var(--grey-500)' }}>
        숫자만 입력하세요 · 답이 여러 개면 쉼표로 구분
      </span>
    </div>
  )
}
