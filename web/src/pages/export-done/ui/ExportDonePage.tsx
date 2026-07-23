import { useNavigate } from 'react-router-dom'
import { Button, SuccessGraphic } from '@/shared/ui'

const GRADIENT = 'linear-gradient(180deg, var(--color-success-weak) 0%, var(--color-bg-primary) 55%)'

/** PDF 내보내기 완료 (08-2, F-07) — 생성된 시험지 다운로드 안내 */
export function ExportDonePage() {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: GRADIENT }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 24px' }}>
        <SuccessGraphic />
        <h1
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            animation: 'jjik-rise-in 0.5s ease-out 0.25s both',
          }}
        >
          PDF가 만들어졌어요
        </h1>
        <p
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: 14,
            lineHeight: 1.5,
            color: 'var(--color-text-secondary)',
            animation: 'jjik-rise-in 0.5s ease-out 0.35s both',
          }}
        >
          단어 34개가 담겼어요
          <br />
          다운로드 링크는 24시간 뒤 만료돼요
        </p>
        <p
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--color-text-tertiary)',
            animation: 'jjik-rise-in 0.5s ease-out 0.45s both',
          }}
        >
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

