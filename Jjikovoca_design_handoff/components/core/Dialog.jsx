import React from 'react'

export function Dialog({ open, onClose, children }) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'var(--color-overlay-dialog)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-lg)', zIndex: 100 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-2xl)', maxWidth: 420, width: '100%', fontFamily: 'var(--font-sans)' }}
      >
        {children}
      </div>
    </div>
  )
}
