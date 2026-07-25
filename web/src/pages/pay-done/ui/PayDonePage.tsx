import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button, SuccessGraphic } from '@/shared/ui'
import { fetchMe } from '@/entities/user'

const GRADIENT = 'linear-gradient(180deg, var(--color-success-weak) 0%, var(--color-bg-primary) 55%)'

// ISO → "M월 D일"
function mmdd(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : `${d.getMonth() + 1}월 ${d.getDate()}일`
}

/** 결제 완료 (19) — 모의 결제 성공 */
export function PayDonePage() {
  const navigate = useNavigate()
  const me = useQuery({ queryKey: ['me'], queryFn: fetchMe })
  const amount = me.data?.premiumAmount ?? 4900
  const nextDate = mmdd(me.data?.premiumExpiresAt)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: GRADIENT }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 24px' }}>
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
          프리미엄 시작!
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
          이제 힌트·PDF·리포트가 모두 열렸어요.
          <br />
          영수증은 이메일로 보내드렸어요.
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
          결제 금액 ₩{amount.toLocaleString()} · 다음 결제 {nextDate} · 마이페이지에서 관리
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
