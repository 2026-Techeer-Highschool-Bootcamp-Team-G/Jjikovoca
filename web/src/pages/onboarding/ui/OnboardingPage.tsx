import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui'

const GRADIENT = 'linear-gradient(180deg, var(--color-brand-weak) 0%, var(--color-bg-primary) 55%)'

/** 온보딩 (F-01) — 01 온보딩 */
export function OnboardingPage() {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: GRADIENT }}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          padding: '0 24px',
        }}
      >
        <CaptureGraphic />
        <h1
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 1.35,
            color: 'var(--color-text-primary)',
          }}
        >
          시험지를 찍으면
          <br />
          나만의 단어장이 됩니다
        </h1>
        <p style={{ margin: 0, textAlign: 'center', fontSize: 15, lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
          모르는 단어에 형광펜만 그으면
          <br />
          AI가 문맥에 맞는 뜻으로 카드를 만들어요
        </p>
      </div>

      <div style={{ background: 'var(--color-bg-primary)', padding: '12px var(--spacing-xl) 32px' }}>
        <Button block size="lg" onClick={() => navigate('/login')}>
          시작하기
        </Button>
      </div>
    </div>
  )
}

function CaptureGraphic() {
  return (
    <div
      style={{
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
      aria-hidden
    >
      <span style={{ fontSize: 88 }}>📸</span>
      <span style={{ position: 'absolute', top: 38, right: 44, fontSize: 28, color: 'var(--yellow-500)' }}>
        ✦
      </span>
    </div>
  )
}
