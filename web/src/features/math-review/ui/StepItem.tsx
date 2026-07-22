import type { MathStep } from '../model/types'

interface Props {
  step: MathStep
  open: boolean
  highlighted: boolean
  onToggle: () => void
}

// 사고 단계 아코디언 항목 (StepItem 74:71) — Locked/Open/Highlighted(F-18 진단 연계)
export function StepItem({ step, open, highlighted, onToggle }: Props) {
  const num = open
    ? { bg: 'var(--color-brand-weak)', fg: 'var(--color-brand-primary)' }
    : highlighted
      ? { bg: 'var(--color-warning-weak)', fg: 'var(--color-warning-primary)' }
      : { bg: 'var(--grey-100)', fg: 'var(--grey-500)' }

  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        width: '100%',
        textAlign: 'left',
        background: 'var(--color-bg-elevated)',
        border: highlighted
          ? '1.5px solid var(--color-warning-primary)'
          : '1px solid var(--color-border-default)',
        borderRadius: 14,
        padding: '14px 16px',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', width: '100%' }}>
        <span
          style={{
            width: 24,
            height: 24,
            flexShrink: 0,
            borderRadius: 'var(--radius-full)',
            background: num.bg,
            color: num.fg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {step.no}
        </span>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-tertiary)' }}>
              {step.no}단계
            </span>
            {highlighted && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  padding: '1px 6px',
                  borderRadius: 6,
                  background: 'var(--color-warning-weak)',
                  color: 'var(--color-warning-primary)',
                }}
              >
                주의
              </span>
            )}
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
            {step.title}
          </span>
        </div>
        <span style={{ fontSize: 14, color: 'var(--grey-500)' }}>{open ? '▴' : '▾'}</span>
      </div>

      {open ? (
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
          {step.content}
        </p>
      ) : (
        !highlighted && (
          <span style={{ fontSize: 11, color: 'var(--grey-500)' }}>탭해서 사고 과정을 확인하세요</span>
        )
      )}
    </button>
  )
}
