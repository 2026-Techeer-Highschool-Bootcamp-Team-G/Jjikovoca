import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost' | 'weak'
type Size = 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  block?: boolean
}

// TDS Button (6:50). Fill(primary) / Weak(ghost) · Size M48(md) / L52(lg) · block=full width
export function Button({ variant = 'primary', size = 'md', block = false, style, ...rest }: Props) {
  const sizeStyle =
    size === 'lg'
      ? { height: 52, fontSize: 17, borderRadius: 'var(--radius-lg)', padding: '0 var(--spacing-2xl)' }
      : {
          padding: 'var(--spacing-sm) var(--spacing-lg)',
          fontSize: 15,
          borderRadius: 'var(--radius-md)',
        }
  const variantStyle =
    variant === 'primary'
      ? {
          background: 'var(--color-brand-primary)',
          color: 'var(--color-text-inverse)',
          border: '1px solid transparent',
        }
      : variant === 'weak'
        ? {
            background: 'var(--color-brand-weak)',
            color: 'var(--color-text-brand)',
            border: '1px solid transparent',
          }
        : {
            background: 'transparent',
            color: 'var(--color-brand-primary)',
            border: '1px solid var(--color-border-default)',
          }
  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 500,
        cursor: 'pointer',
        width: block ? '100%' : undefined,
        ...sizeStyle,
        ...variantStyle,
        ...style,
      }}
      {...rest}
    />
  )
}
