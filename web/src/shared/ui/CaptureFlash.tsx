// 캡처 순간 이펙트 (motion-spec 33:301) — 화이트 플래시 120ms → 스파클 버스트 400ms → +5 XP 칩 상승 600ms
export function CaptureFlash({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, pointerEvents: 'none' }} aria-hidden>
      {/* 화이트 플래시 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--common-white)',
          animation: 'jjik-flash 500ms ease-out forwards',
        }}
      />
      {/* 스파클 버스트 (화면 중앙) */}
      {[
        { dx: 0, dy: -46, size: 22, delay: 0 },
        { dx: 40, dy: -18, size: 16, delay: 40 },
        { dx: -40, dy: -18, size: 16, delay: 40 },
        { dx: 26, dy: 34, size: 13, delay: 80 },
        { dx: -26, dy: 34, size: 13, delay: 80 },
      ].map((s, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: `calc(50% + ${s.dy}px)`,
            left: `calc(50% + ${s.dx}px)`,
            fontSize: s.size,
            color: 'var(--yellow-500)',
            animation: `jjik-burst 400ms ease-out ${s.delay}ms forwards`,
          }}
        >
          ✦
        </span>
      ))}
      {/* +5 XP 칩 상승 */}
      <span
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 130,
          transform: 'translate(-50%, 12px)',
          background: 'linear-gradient(180deg, #ffea7a, #ffd84d)',
          color: 'var(--yellow-900)',
          fontSize: 15,
          fontWeight: 700,
          padding: '7px 16px',
          borderRadius: 'var(--radius-full)',
          boxShadow: '0 6px 16px rgba(242,191,26,0.5)',
          animation: 'jjik-xp-rise 600ms ease-out forwards',
        }}
      >
        ⚡ +5 XP
      </span>
    </div>
  )
}
