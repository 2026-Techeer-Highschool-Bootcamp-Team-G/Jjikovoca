// 성공/완료 그래픽 — 초록 원 체크가 스프링으로 팝 + 링 퍼짐 + 반짝임 (토스식)
export function SuccessGraphic() {
  return (
    <div
      style={{
        width: 160,
        height: 160,
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--color-success-weak) 0%, rgba(255,255,255,0) 70%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
      aria-hidden
    >
      {/* 체크와 함께 퍼지는 링 */}
      <span
        style={{
          position: 'absolute',
          width: 92,
          height: 92,
          borderRadius: '50%',
          border: '2px solid var(--color-success-primary)',
          animation: 'jjik-success-ring 0.7s ease-out 0.15s both',
        }}
      />
      <div
        style={{
          width: 92,
          height: 92,
          borderRadius: '50%',
          background: 'var(--color-success-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-inverse)',
          fontSize: 44,
          fontWeight: 700,
          animation: 'jjik-pop-spring 0.6s cubic-bezier(0.2, 0.9, 0.3, 1.2) both',
        }}
      >
        ✓
      </div>
      <span
        style={{
          position: 'absolute',
          top: 28,
          right: 30,
          fontSize: 24,
          color: 'var(--yellow-500)',
          animation: 'jjik-twinkle 1.4s ease-in-out 0.5s infinite',
        }}
      >
        ✦
      </span>
    </div>
  )
}
