import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Button, SuccessGraphic } from '@/shared/ui'
import { downloadExport } from '@/features/export'

const GRADIENT = 'linear-gradient(180deg, var(--color-success-weak) 0%, var(--color-bg-primary) 55%)'

/** PDF 내보내기 완료 (08-2, F-07) — 생성된 시험지 실제 다운로드 링크 제공 */
export function ExportDonePage() {
  const navigate = useNavigate()
  const location = useLocation()
  // 학습 설정/단어 선택이 넘긴 실제 다운로드 URL(없으면 다운로드 버튼 숨김)
  const downloadUrl = (location.state as { downloadUrl?: string } | null)?.downloadUrl

  // 인증 필수 엔드포인트라 앵커 네비게이션이 아니라 헤더를 실어 blob 으로 받아 저장한다
  const download = useMutation({ mutationFn: () => downloadExport(downloadUrl!) })

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
          다운로드 링크는 1시간 뒤 만료돼요
        </p>
      </div>

      <div style={{ background: 'var(--color-bg-primary)', padding: '12px var(--spacing-xl) 32px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {downloadUrl && (
          <>
            <Button block size="lg" disabled={download.isPending} onClick={() => download.mutate()}>
              {download.isPending ? '내려받는 중…' : '📄 PDF 다운로드'}
            </Button>
            {download.isError && (
              <span style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-danger)' }}>
                다운로드에 실패했어요. 다시 시도해 주세요.
              </span>
            )}
          </>
        )}
        <Button block size="lg" variant={downloadUrl ? 'weak' : 'primary'} onClick={() => navigate('/wrong-note')}>
          단어장으로 가기
        </Button>
      </div>
    </div>
  )
}
