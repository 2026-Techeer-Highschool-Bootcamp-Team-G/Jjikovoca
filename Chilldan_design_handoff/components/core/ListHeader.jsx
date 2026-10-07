import React from 'react'

export function ListHeader({ title, link, onLink }) {
  return (
    <div style={{ display: 'flex', height: 48, alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--spacing-xl)' }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 17, fontWeight: 500, color: 'var(--color-text-primary)' }}>{title}</span>
      {link && (
        <button type="button" onClick={onLink} style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-brand)', background: 'none', border: 'none', padding: 0 }}>
          {link}
        </button>
      )}
    </div>
  )
}
