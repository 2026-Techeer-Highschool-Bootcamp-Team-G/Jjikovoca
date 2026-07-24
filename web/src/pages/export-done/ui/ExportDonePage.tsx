import { useLocation, useNavigate } from 'react-router-dom'
import { Button, SuccessGraphic } from '@/shared/ui'

const GRADIENT = 'linear-gradient(180deg, var(--color-success-weak) 0%, var(--color-bg-primary) 55%)'

/** PDF 내보내기 완료 (08-2, F-07) — 생성된 시험지 실제 다운로드 링크 제공 */
export function ExportDonePage() {
  const navigate = useNavigate()
  const location = useLocation()
  // ExportPage 가 넘긴 실제 다운로드 URL(없으면 다운로드 버튼 숨김)
  const downloadUrl = (location.state as { downloadUrl?: string } | null)?.downloadUrl

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
          아래 버튼으로 시험지를 내려받으세요
          <br />
          다운로드 링크는 24시간 뒤 만료돼요
        </p>
      </div>

      <div style={{ background: 'var(--color-bg-primary)', padding: '12px var(--spacing-xl) 32px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {downloadUrl && (
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer" download style={{ textDecoration: 'none' }}>
            <Button block size="lg">
              📄 PDF 다운로드
            </Button>
          </a>
        )}
        <Button block size="lg" variant={downloadUrl ? 'weak' : 'primary'} onClick={() => navigate('/wrong-note')}>
          단어장으로 가기
        </Button>
      </div>
    </div>
  )
}
