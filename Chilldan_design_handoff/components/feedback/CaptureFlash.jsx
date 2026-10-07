import React from 'react'

const SPARKS = [
  { dx: 0, dy: -46, size: 22, delay: 0 },
  { dx: 40, dy: -18, size: 16, delay: 40 },
  { dx: -40, dy: -18, size: 16, delay: 40 },
  { dx: 26, dy: 34, size: 13, delay: 80 },
  { dx: -26, dy: 34, size: 13, delay: 80 },
]

// 캡처 순간 이펙트 — 화이트 플래시 → 스파클 버스트 400ms → +5 XP 칩 상승 600ms
export function CaptureFlash({ active, xpLabel = '⚡ +5 XP' }) {
  if (!active) return null
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, pointerEvents: 'none', fontFamily: 'var(--font-sans)' }} aria-hidden>
      <div style={{ position: 'absolute', inset: 0, background: 'var(--common-white)', animation: 'jjik-flash 500ms ease-out forwards' }} />
      {SPARKS.map((s, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: 'calc(50% + ' + s.dy + 'px)',
            left: 'calc(50% + ' + s.dx + 'px)',
            fontSize: s.size,
            color: 'var(--yellow-500)',
            animation: 'jjik-burst 400ms ease-out ' + s.delay + 'ms forwards',
          }}
        >
          ✦
        </span>
      ))}
      <span
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 130,
          transform: 'translate(-50%, 12px)',
          background: 'var(--gradient-marker)',
          color: 'var(--yellow-900)',
          fontSize: 15,
          fontWeight: 700,
          padding: '7px 16px',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-xp-chip)',
          animation: 'jjik-xp-rise 600ms ease-out forwards',
        }}
      >
        {xpLabel}
      </span>
    </div>
  )
}
