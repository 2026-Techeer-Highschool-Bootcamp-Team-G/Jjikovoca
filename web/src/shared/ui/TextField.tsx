interface Props {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  helper?: string
  type?: string
}

// TDS TextField (59:54) — 라벨 + 입력 필드(bg-secondary) + 헬퍼. 로그인·검색·폼 공용.
export function TextField({ label, value, onChange, placeholder, helper, type = 'text' }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      {label && (
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          {label}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          height: 52,
          padding: '0 16px',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          background: 'var(--color-bg-secondary)',
          fontSize: 15,
          color: 'var(--color-text-primary)',
          outline: 'none',
          width: '100%',
        }}
      />
      {helper && (
        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{helper}</span>
      )}
    </div>
  )
}
