import React from 'react'

/** 구독 플랜 카드 (FR-19) — Free / Plus 3,900원 / Pro 6,900원, 일일 AI 분석 한도 확장 */
export function PlanCard({ name, price, period = '월', quota, features = [], current = false, recommended = false, disabled = false, onSelect, ctaLabel }) {
  const [pressed, setPressed] = React.useState(false)
  return (
    <section
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 16,
        background: 'var(--color-bg-primary)',
        border: recommended ? '1.5px solid var(--color-brand-primary)' : '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-card-14)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {recommended && (
        <span style={{ position: 'absolute', top: -9, left: 16, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--color-brand-primary)', color: 'var(--color-text-inverse)', fontSize: 10, fontWeight: 700 }}>
          추천
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>{name}</span>
        {current && (
          <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)', fontSize: 10, fontWeight: 500 }}>
            이용 중
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
          {typeof price === 'number' ? '₩' + price.toLocaleString() : price}
        </span>
        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>/ {period}</span>
      </div>
      {quota && (
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-brand)' }}>
          <mark style={{ background: 'var(--gradient-highlighter)', color: 'var(--color-text-primary)', padding: '0 3px', borderRadius: 3 }}>{quota}</mark>
        </span>
      )}
      {features.length > 0 && (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {features.map((t) => (
            <li key={t} style={{ display: 'flex', gap: 6, fontSize: 13, lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
              <span style={{ color: 'var(--color-brand-primary)' }} aria-hidden>✓</span>
              {t}
            </li>
          ))}
        </ul>
      )}
      {onSelect && (
        <button
          type="button"
          disabled={disabled || current}
          onClick={onSelect}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          style={{
            height: 44,
            marginTop: 2,
            border: 'none',
            borderRadius: 'var(--radius-md)',
            background: current ? 'var(--color-bg-secondary)' : 'var(--color-brand-primary)',
            color: current ? 'var(--color-text-tertiary)' : 'var(--color-text-inverse)',
            fontFamily: 'inherit',
            fontSize: 15,
            fontWeight: 700,
            cursor: disabled || current ? 'default' : 'pointer',
            opacity: disabled ? 0.4 : 1,
            transform: pressed && !current && !disabled ? 'scale(0.98)' : undefined,
            transition: 'transform 120ms var(--ease-standard)',
          }}
        >
          {ctaLabel || (current ? '이용 중' : name + ' 시작하기')}
        </button>
      )}
    </section>
  )
}
