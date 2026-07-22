import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui'

const GRADIENT = 'linear-gradient(180deg, var(--color-success-weak) 0%, var(--color-bg-primary) 55%)'

/** 결제 완료 (19) — 모의 결제 성공 */
export function PayDonePage() {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: GRADIENT }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 24px' }}>
        <SuccessGraphic />
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>프리미엄 시작!</h1>
        <p style={{ margin: 0, textAlign: 'center', fontSize: 14, lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
          이제 힌트·PDF·리포트가 모두 열렸어요.
          <br />
          영수증은 이메일로 보내드렸어요.
        </p>
        <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: 'var(--color-text-tertiary)' }}>
          결제 금액 ₩4,900 · 다음 결제 8월 20일 · 마이페이지에서 관리
        </p>
      </div>

      <div style={{ background: 'var(--color-bg-primary)', padding: '12px var(--spacing-xl) 32px' }}>
        <Button block size="lg" onClick={() => navigate('/')}>
          홈으로 — 잠금 해제 확인하기
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
