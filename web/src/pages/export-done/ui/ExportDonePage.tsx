import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui'

const GRADIENT = 'linear-gradient(180deg, var(--color-success-weak) 0%, var(--color-bg-primary) 55%)'

/** PDF 내보내기 완료 (08-2, F-07) — 생성된 시험지 다운로드 안내 */
export function ExportDonePage() {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: GRADIENT }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 24px' }}>
        <SuccessGraphic />
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>PDF가 만들어졌어요</h1>
        <p style={{ margin: 0, textAlign: 'center', fontSize: 14, lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
          단어 34개가 담겼어요
          <br />
          다운로드 링크는 24시간 뒤 만료돼요
        </p>
        <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: 'var(--color-text-tertiary)' }}>
          찍어보카_오답노트_0720.pdf · 2.4MB
        </p>
      </div>

      <div style={{ background: 'var(--color-bg-primary)', padding: '12px var(--spacing-xl) 32px' }}>
        <Button block size="lg" onClick={() => navigate('/wrong-note')}>
          단어장으로 가기
        </Button>
      </div>
    </div>
  )
}

function SuccessGraphic() {
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
        }}
      >
        ✓
      </div>
      <span style={{ position: 'absolute', top: 28, right: 30, fontSize: 24, color: 'var(--yellow-500)' }}>✦</span>
    </div>
  )
}
