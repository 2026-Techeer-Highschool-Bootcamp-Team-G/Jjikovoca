import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Dialog } from '@/shared/ui'
import { logout } from '@/features/auth'

/** 탈퇴 확인 (21) — 파괴적 액션 확인 다이얼로그 */
export function WithdrawPage() {
  const navigate = useNavigate()
  // 계정 삭제 엔드포인트는 백엔드 미제공 → 최소한 세션을 정리(logout: POST /auth/logout + 토큰 제거)하고 로그인으로
  const exit = useMutation({
    mutationFn: logout,
    onSettled: () => navigate('/login', { replace: true }),
  })
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)' }}>
      <Dialog open onClose={() => navigate(-1)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
          <h2 style={{ margin: 0, textAlign: 'center', fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            정말 탈퇴할까요?
          </h2>
          <p style={{ margin: 0, textAlign: 'center', fontSize: 14, lineHeight: '21px', color: 'var(--color-text-secondary)' }}>
            단어카드·오답노트·학습 기록이 모두 삭제되며 복구할 수 없어요. 결제 기록은 법령에 따라 보관돼요.
          </p>
          <div style={{ display: 'flex', gap: 8, paddingTop: 14 }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{ flex: 1, height: 48, borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-brand-weak)', color: 'var(--color-text-brand)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => exit.mutate()}
              disabled={exit.isPending}
              style={{ flex: 1, height: 48, borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-danger-primary)', color: 'var(--color-text-inverse)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
            >
              {exit.isPending ? '처리 중…' : '탈퇴하기'}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
