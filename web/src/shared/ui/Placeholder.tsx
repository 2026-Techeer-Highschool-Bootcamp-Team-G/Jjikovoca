interface Props {
  title: string
  note?: string
}

// 아직 설계 전 화면의 임시 자리표시. 내비게이션이 끊기지 않게 유지.
export function Placeholder({ title, note }: Props) {
  return (
    <div style={{ padding: '24px var(--spacing-xl)', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>
        {title}
      </h1>
      {note && (
        <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary)' }}>{note}</p>
      )}
    </div>
  )
}
