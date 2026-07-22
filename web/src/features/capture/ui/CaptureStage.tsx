import type { CSSProperties } from 'react'
import { IconClose } from '@/shared/ui'

interface Props {
  onClose: () => void
  onCapture: () => void
}

const BRACKET = '#ffe45e'

// 촬영 화면 (130:777) — 다크 카메라 뷰 + 종이 인식(노란 코너 브래킷·글로우) + 촬영 버튼 (F-02)
export function CaptureStage({ onClose, onCapture }: Props) {
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
          onClick={onClose}
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
          <span
            style={{
              position: 'absolute',
              top: -34,
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              background: BRACKET,
              color: 'var(--yellow-900)',
              fontSize: 12,
              fontWeight: 500,
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            ✨ 인식됐어요! 지금 찍어보세요
          </span>

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
              boxShadow: `0 0 24px rgba(255,228,94,0.45)`,
              overflow: 'hidden',
            }}
          >
            {[247, 210, 247, 210, 247, 210, 210].map((w, i) => (
              <div key={i} style={{ height: 7, width: w, maxWidth: '100%', borderRadius: 3.5, background: 'var(--grey-300)' }} />
            ))}
            <span style={{ position: 'absolute', top: 60, right: 40, fontSize: 16 }} aria-hidden>
              ✦
            </span>
            <span style={{ position: 'absolute', top: 220, right: 60, fontSize: 12 }} aria-hidden>
              ✦
            </span>
          </div>

          <Corner style={{ top: -6, left: -6, borderTop: `3px solid ${BRACKET}`, borderLeft: `3px solid ${BRACKET}`, borderTopLeftRadius: 12 }} />
          <Corner style={{ top: -6, right: -6, borderTop: `3px solid ${BRACKET}`, borderRight: `3px solid ${BRACKET}`, borderTopRightRadius: 12 }} />
          <Corner style={{ bottom: -6, left: -6, borderBottom: `3px solid ${BRACKET}`, borderLeft: `3px solid ${BRACKET}`, borderBottomLeftRadius: 12 }} />
          <Corner style={{ bottom: -6, right: -6, borderBottom: `3px solid ${BRACKET}`, borderRight: `3px solid ${BRACKET}`, borderBottomRightRadius: 12 }} />
        </div>
      </div>

      <button
        type="button"
        aria-label="촬영"
        onClick={onCapture}
        style={{
          margin: '0 0 40px',
          width: 72,
          height: 72,
          borderRadius: '50%',
          border: '4px solid rgba(255,255,255,0.5)',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
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
