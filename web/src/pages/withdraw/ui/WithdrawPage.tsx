import { useNavigate } from 'react-router-dom'
import { Dialog } from '@/shared/ui'

/** 탈퇴 확인 (21) — 파괴적 액션 확인 다이얼로그 */
export function WithdrawPage() {
  const navigate = useNavigate()
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
              onClick={() => navigate('/login')}
              style={{ flex: 1, height: 48, borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-danger-primary)', color: 'var(--color-text-inverse)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
            >
              탈퇴하기
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
