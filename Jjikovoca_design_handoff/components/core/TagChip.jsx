import React from 'react'

/** 다중 태그 칩 (FR-04) — 시험 태그는 강조(브랜드 위크 + 📅 + D-day), 일반 태그는 회색 사각 칩 */
export function TagChip({ label, kind = 'tag', dday, active = false, onClick, onRemove, size = 'md' }) {
  const pad = size === 'sm' ? '2px 7px' : '3px 9px'
  const font = size === 'sm' ? 10 : 11
  const exam = kind === 'exam'
  const more = kind === 'more'
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    maxWidth: 148,
    padding: pad,
    fontFamily: 'var(--font-sans)',
    fontSize: font,
    fontWeight: exam ? 700 : 500,
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    borderRadius: exam || more ? 'var(--radius-full)' : 5,
    border: '1px solid transparent',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'background 160ms var(--ease-standard), color 160ms var(--ease-standard)',
  }
  const tone = more
    ? { background: 'transparent', color: 'var(--color-text-tertiary)', borderColor: 'var(--color-border-default)' }
    : exam
      ? { background: active ? 'var(--color-brand-primary)' : 'var(--color-brand-weak)', color: active ? 'var(--color-text-inverse)' : 'var(--color-brand-primary)' }
      : { background: active ? 'var(--color-text-primary)' : 'var(--color-bg-secondary)', color: active ? 'var(--color-bg-primary)' : 'var(--color-text-secondary)' }
  const text = exam ? '📅 ' + label + (dday != null ? ' D-' + dday : '') : label
  const El = onClick ? 'button' : 'span'
  return (
    <El type={onClick ? 'button' : undefined} onClick={onClick} style={{ ...base, ...tone }}>
      {text}
      {onRemove && (
        <span
          role="button"
          aria-label={label + ' 태그 삭제'}
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          style={{ opacity: 0.55, cursor: 'pointer', fontSize: font + 1 }}
        >
          ×
        </span>
      )}
    </El>
  )
}
