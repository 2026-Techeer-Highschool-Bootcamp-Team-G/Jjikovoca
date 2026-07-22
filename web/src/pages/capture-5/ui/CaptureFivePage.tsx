import type { CSSProperties, ReactNode, SVGProps } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconClose, CaptureFlash } from '@/shared/ui'

// 05-5 촬영 (130:826) — 네모 박스 드래그 모드. 노란 브래킷 + 종이 위 점선 네모 선택 박스 +
// 모드 토글(형광펜/네모 박스 활성) (F-02, 수학 촬영)
const BRACKET = '#ffe45e'
const PAPER_LINES = [247, 210, 247, 210, 210, 247, 210, 210]

export function CaptureFivePage() {
  const navigate = useNavigate()
  const [shooting, setShooting] = useState(false)
  // 캡처: 화이트 플래시 → 스파클 버스트 → +5 XP 후 수학 분석으로 (네모 박스=수학 문제)
  const shoot = () => {
    if (shooting) return
    setShooting(true)
    setTimeout(() => navigate('/capture?phase=analyzing&subject=math'), 520)
  }

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
            {/* 점선 네모 선택 박스 (130:875) */}
            <div
              style={{
                position: 'absolute',
                top: 77,
                left: 28,
                width: 247,
                height: 231,
                borderRadius: 12,
                border: '6px dashed #fee671',
              }}
              aria-hidden
            />
            <span style={{ position: 'absolute', top: 45, left: 20, fontSize: 18, animation: 'jjik-twinkle 0.6s ease-in-out infinite' }} aria-hidden>
              ✦
            </span>
            <span style={{ position: 'absolute', top: 305, left: 262, fontSize: 16, animation: 'jjik-twinkle 0.6s ease-in-out 0.3s infinite' }} aria-hidden>
              ✦
            </span>
          </div>

          <Corner style={{ top: -6, left: -6, borderTop: `3px solid ${BRACKET}`, borderLeft: `3px solid ${BRACKET}`, borderTopLeftRadius: 12 }} />
          <Corner style={{ top: -6, right: -6, borderTop: `3px solid ${BRACKET}`, borderRight: `3px solid ${BRACKET}`, borderTopRightRadius: 12 }} />
          <Corner style={{ bottom: -6, left: -6, borderBottom: `3px solid ${BRACKET}`, borderLeft: `3px solid ${BRACKET}`, borderBottomLeftRadius: 12 }} />
          <Corner style={{ bottom: -6, right: -6, borderBottom: `3px solid ${BRACKET}`, borderRight: `3px solid ${BRACKET}`, borderBottomRightRadius: 12 }} />
        </div>
      </div>

      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>
        모르는 문제와 풀이에 네모 박스로 드래그하세요
      </span>

      <ModeToggle mode="box" onHighlighter={() => navigate('/capture-4')} />

      <button
        type="button"
        aria-label="촬영"
        onClick={shoot}
        style={{
          margin: '20px 0 40px',
          width: 72,
          height: 72,
          borderRadius: '50%',
          border: '4px solid var(--color-brand-primary)',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--common-white)' }} />
      </button>

      <CaptureFlash active={shooting} />
    </div>
  )
}

// 형광펜 / 네모 박스 모드 토글 (130:856) — 세그먼트 탭으로 05-4↔05-5 전환
function ModeToggle({
  mode,
  onHighlighter,
  onBox,
}: {
  mode: 'highlighter' | 'box'
  onHighlighter?: () => void
  onBox?: () => void
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        gap: 4,
        padding: 4,
        borderRadius: 'var(--radius-full)',
        background: 'rgba(255,255,255,0.14)',
      }}
    >
      <Seg active={mode === 'highlighter'} icon={<IconHighlighter size={16} />} label="형광펜" onClick={onHighlighter} />
      <Seg active={mode === 'box'} icon={<IconPlus size={16} />} label="네모 박스" onClick={onBox} />
    </div>
  )
}

function Seg({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean
  icon: ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: 'none',
        cursor: onClick && !active ? 'pointer' : 'default',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        borderRadius: 'var(--radius-full)',
        background: active ? 'var(--common-white)' : 'transparent',
        color: active ? 'var(--grey-900)' : 'rgba(255,255,255,0.75)',
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function IconHighlighter({ size = 16, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...rest}>
      <path d="M3.7 12.5 2.8 14.2h2.4l.8-1.5" />
      <path d="M10.5 3.5l2 2-5.3 5.3-2.6.6.6-2.6z" />
    </svg>
  )
}

function IconPlus({ size = 16, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden {...rest}>
      <line x1="8" y1="3.3" x2="8" y2="12.7" />
      <line x1="3.3" y1="8" x2="12.7" y2="8" />
    </svg>
  )
}

function Corner({ style }: { style: CSSProperties }) {
  return (
    <div
      style={{ position: 'absolute', width: 30, height: 30, animation: 'jjik-bracket-in 220ms ease-out', ...style }}
      aria-hidden
    />
  )
}
