import type { ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
}

// 하단 바텀시트 (100:737) — dim 오버레이 + 상단 라운드 시트 + 드래그 핸들
export function BottomSheet({ open, onClose, children }: Props) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'var(--color-overlay-dim)',
        display: 'flex',
        alignItems: 'flex-end',
        animation: 'omc-overlay-in 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          margin: '0 auto',
          background: 'var(--color-bg-elevated)',
          borderRadius: '20px 20px 0 0',
          padding: '10px var(--spacing-xl) 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          animation: 'omc-sheet-up 0.25s ease-out',
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: 'var(--grey-200)',
            alignSelf: 'center',
          }}
          aria-hidden
        />
        {children}
      </div>
    </div>
  )
}
