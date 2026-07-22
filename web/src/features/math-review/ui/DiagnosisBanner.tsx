// F-18 오답 원인 자동 진단 배너 (76:547) — 풀이 흔적을 읽어 막힌 단계를 짚어준다
export function DiagnosisBanner({ description }: { description: string }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        background: 'var(--color-warning-weak)',
        borderRadius: 12,
        padding: '10px 14px',
      }}
    >
      <span style={{ fontSize: 16 }} aria-hidden>
        ✍️
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-warning-primary)' }}>
          지난 풀이를 읽어봤어요 — AI 진단
        </span>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
          {description}
        </span>
      </div>
    </div>
  )
}
