import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconClose } from '@/shared/ui'

// 05-2 촬영 (136:1150) — 종이 미인식(회색 코너 브래킷) + 하단 가이드 칩 (F-02)
const BRACKET = 'var(--grey-300)'
const PAPER_LINES = [247, 210, 247, 210, 210, 247, 210, 210]

export function CaptureTwoPage() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'var(--grey-900)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 56,
          width: '100%',
          position: 'relative',
        }}
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            left: 12,
            background: 'none',
            border: 'none',
            color: 'var(--common-white)',
            cursor: 'pointer',
            display: 'inline-flex',
          }}
        >
          <IconClose />
        </button>
        <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--common-white)' }}>촬영</span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 300, height: 420 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--common-white)',
              borderRadius: 12,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              overflow: 'hidden',
            }}
          >
            {PAPER_LINES.map((w, i) => (
              <div key={i} style={{ height: 7, width: w, maxWidth: '100%', borderRadius: 3.5, background: 'var(--grey-300)' }} />
            ))}
            {/* 인식 전 스캔 라인 (미인식 상태 — 프레임 탐지 중) */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 2,
                background: 'linear-gradient(90deg, rgba(49,130,246,0) 0%, rgba(49,130,246,0.7) 50%, rgba(49,130,246,0) 100%)',
                animation: 'jjik-scan 2s ease-in-out infinite',
              }}
              aria-hidden
            />
            <span style={{ position: 'absolute', top: 168, right: -22, fontSize: 12 }} aria-hidden>
              ✦
            </span>
          </div>

          <Corner style={{ top: -6, left: -6, borderTop: `3px solid ${BRACKET}`, borderLeft: `3px solid ${BRACKET}`, borderTopLeftRadius: 12 }} />
          <Corner style={{ top: -6, right: -6, borderTop: `3px solid ${BRACKET}`, borderRight: `3px solid ${BRACKET}`, borderTopRightRadius: 12 }} />
          <Corner style={{ bottom: -6, left: -6, borderBottom: `3px solid ${BRACKET}`, borderLeft: `3px solid ${BRACKET}`, borderBottomLeftRadius: 12 }} />
          <Corner style={{ bottom: -6, right: -6, borderBottom: `3px solid ${BRACKET}`, borderRight: `3px solid ${BRACKET}`, borderBottomRightRadius: 12 }} />
        </div>
      </div>

      <span
        style={{
          background: 'rgba(255,255,255,0.14)',
          color: 'rgba(255,255,255,0.8)',
          fontSize: 12,
          fontWeight: 500,
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          marginBottom: 24,
        }}
      >
        문제를 프레임에 맞춰 주세요
      </span>

      <button
        type="button"
        aria-label="촬영"
        onClick={() => navigate('/capture-3')}
        style={{
          margin: '0 0 40px',
          width: 72,
          height: 72,
          borderRadius: '50%',
          border: '4px solid rgba(255,255,255,0.3)',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          opacity: 0.35,
        }}
      >
        <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--common-white)' }} />
      </button>
    </div>
  )
}

function Corner({ style }: { style: CSSProperties }) {
  return <div style={{ position: 'absolute', width: 30, height: 30, ...style }} aria-hidden />
}
