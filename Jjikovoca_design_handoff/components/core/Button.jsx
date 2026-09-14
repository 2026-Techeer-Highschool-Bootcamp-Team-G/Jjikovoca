import React from 'react'

// TDS Button (6:50). Fill(primary) / Weak(weak) / Ghost(테두리) · Size M(md) / L52(lg) · block=full width
export function Button({ variant = 'primary', size = 'md', block = false, style, children, ...rest }) {
  const sizeStyle =
    size === 'lg'
      ? { height: 52, fontSize: 17, borderRadius: 'var(--radius-lg)', padding: '0 var(--spacing-2xl)' }
      : { padding: 'var(--spacing-sm) var(--spacing-lg)', fontSize: 15, borderRadius: 'var(--radius-md)' }
  const variantStyle =
    variant === 'primary'
      ? { background: 'var(--color-brand-primary)', color: 'var(--color-text-inverse)', border: '1px solid transparent' }
      : variant === 'weak'
        ? { background: 'var(--color-brand-weak)', color: 'var(--color-text-brand)', border: '1px solid transparent' }
        : { background: 'transparent', color: 'var(--color-brand-primary)', border: '1px solid var(--color-border-default)' }
  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        cursor: rest.disabled ? 'default' : 'pointer',
        opacity: rest.disabled ? 0.4 : 1,
        width: block ? '100%' : undefined,
        ...sizeStyle,
        ...variantStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
