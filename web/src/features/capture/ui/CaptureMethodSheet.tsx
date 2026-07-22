interface Props {
  onCamera: () => void
  onAlbum: () => void
  onCancel: () => void
}

// 촬영 방식 선택 시트 (133:809) — 사진 촬영(카메라) / 앨범에서 선택(파일) / 취소
export function CaptureMethodSheet({ onCamera, onAlbum, onCancel }: Props) {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          사진 가져오기
        </span>
        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
          시험지를 촬영하거나 앨범에서 선택하세요
        </span>
      </div>

      <OptionRow
        active
        emoji="📷"
        iconBg="var(--color-brand-weak)"
        title="사진 촬영"
        sub="카메라로 시험지를 바로 찍기"
        onClick={onCamera}
      />
      <OptionRow
        emoji="🖼"
        iconBg="var(--teal-50)"
        title="앨범에서 선택"
        sub="저장된 사진 불러오기"
        onClick={onAlbum}
      />

      <button
        type="button"
        onClick={onCancel}
        style={{
          width: '100%',
          padding: '14px 0',
          borderRadius: 14,
          border: 'none',
          background: 'var(--grey-100)',
          color: 'var(--color-text-secondary)',
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        취소
      </button>
    </>
  )
}

function OptionRow({
  active = false,
  emoji,
  iconBg,
  title,
  sub,
  onClick,
}: {
  active?: boolean
  emoji: string
  iconBg: string
  title: string
  sub: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        gap: 14,
        alignItems: 'center',
        width: '100%',
        textAlign: 'left',
        padding: 14,
        borderRadius: 14,
        background: 'var(--color-bg-elevated)',
        border: active
          ? '1.5px solid var(--color-brand-primary)'
          : '1px solid var(--color-border-default)',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          width: 44,
          height: 44,
          flexShrink: 0,
          borderRadius: 'var(--radius-full)',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
        }}
        aria-hidden
      >
        {emoji}
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {title}
        </span>
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{sub}</span>
      </div>
      <span style={{ fontSize: 18, color: 'var(--grey-500)' }}>›</span>
    </button>
  )
}
