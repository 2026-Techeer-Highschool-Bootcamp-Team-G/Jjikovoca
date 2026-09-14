import React from 'react'

// TDS TextField (59:54) — 라벨 + 입력 필드(bg-secondary, 테두리 없음, 52px) + 헬퍼
export function TextField({ label, value, onChange, placeholder, helper, type = 'text' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      {label && (
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)' }}>{label}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          height: 52,
          padding: '0 16px',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          background: 'var(--color-bg-secondary)',
          fontFamily: 'var(--font-sans)',
          fontSize: 15,
          color: 'var(--color-text-primary)',
          outline: 'none',
          width: '100%',
        }}
      />
      {helper && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>{helper}</span>}
    </div>
  )
}
