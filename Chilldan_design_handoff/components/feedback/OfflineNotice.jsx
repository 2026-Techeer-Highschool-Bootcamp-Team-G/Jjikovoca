import React from 'react'
import { Icon } from '../core/Icon'

/** 네트워크 오류 방어 UI (NFR 5-1) — 흰 화면 대신 네이티브 다이얼로그 수준의 안내를 깐다 */
export function OfflineNotice({ title = '네트워크에 연결되지 않았어요', description = '연결을 확인하고 다시 시도해주세요', onRetry, variant = 'screen' }) {
  if (variant === 'banner') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--color-danger-weak)', color: 'var(--color-text-danger)', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500 }}>
        <span style={{ display: 'inline-flex' }}><Icon name="refresh" size={16} /></span>
        <span style={{ flex: 1, minWidth: 0 }}>{title}</span>
        {onRetry && (
          <button type="button" onClick={onRetry} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}>
            다시 시도
          </button>
        )}
      </div>
    )
  }
  return (
    <div style={{ minHeight: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '40px 32px', textAlign: 'center', background: 'var(--color-bg-primary)', fontFamily: 'var(--font-sans)' }}>
      <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-bg-secondary)', color: 'var(--color-text-tertiary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="refresh" size={24} />
      </span>
      <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</span>
      <span style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>{description}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{ marginTop: 6, height: 44, padding: '0 20px', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--color-brand-primary)', color: 'var(--color-text-inverse)', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
        >
          다시 시도
        </button>
      )}
    </div>
  )
}
