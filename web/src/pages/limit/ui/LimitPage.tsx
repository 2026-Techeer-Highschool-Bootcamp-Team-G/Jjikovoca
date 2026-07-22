import { useNavigate } from 'react-router-dom'
import { BottomSheet, Button } from '@/shared/ui'

/** 한도 초과 업셀 (20) — 무료 분석 5회 소진 시 바텀시트 */
export function LimitPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--grey-900)' }}>
      <BottomSheet open onClose={() => navigate(-1)}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '8px 0' }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--color-danger-weak) 0%, rgba(255,255,255,0) 70%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 56,
            }}
            aria-hidden
          >
            ⚠️
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            오늘 무료 분석 5회를 모두 썼어요
          </h2>
          <p style={{ margin: 0, textAlign: 'center', fontSize: 14, lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
            내일 0시에 5회가 다시 채워져요.
            <br />
            프리미엄이면 하루 100회까지 분석할 수 있어요.
          </p>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            <Button block size="lg" onClick={() => navigate('/paywall')}>
              ⭐ 프리미엄으로 무제한에 가깝게
            </Button>
            <Button block size="lg" variant="weak" onClick={() => navigate(-1)}>
              내일 다시 할게요
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
