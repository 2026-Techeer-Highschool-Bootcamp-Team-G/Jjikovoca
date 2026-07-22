import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui'

const GRADIENT = 'linear-gradient(180deg, #fff9e7 0%, var(--color-bg-primary) 55%)'

/** 카드 졸업 (10-3, F-18) — 알아요 4연속으로 라이트너 박스 졸업 */
export function CardDonePage() {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: GRADIENT }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 24px' }}>
        <GraduationGraphic />
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 24,
            padding: '0 var(--spacing-sm)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-success-primary)',
            color: 'var(--color-text-inverse)',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          Box 4 졸업 🎓
        </span>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          ‘sound’ 카드 졸업!
        </h1>
        <p style={{ margin: 0, textAlign: 'center', fontSize: 15, lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
          알아요 4번 연속! 이제 이 단어는
          <br />
          피드에서 조용히 쉬러 갑니다
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, background: 'var(--color-bg-primary)', padding: '12px var(--spacing-xl) 32px' }}>
        <Button variant="weak" size="lg" block onClick={() => navigate(-1)}>
          카드 공유
        </Button>
        <Button size="lg" block onClick={() => navigate(-1)}>
          다음 카드
        </Button>
      </div>
    </div>
  )
}

// graphic/graduation (16:18) — 노란 원 배경 + 졸업모 + 반짝임
function GraduationGraphic() {
  return (
    <div
      style={{
        width: 160,
        height: 160,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #fff2c4 0%, rgba(255,255,255,0) 70%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
      aria-hidden
    >
      <span style={{ fontSize: 72, lineHeight: 1 }}>🎓</span>
      <span style={{ position: 'absolute', top: 24, right: 26, fontSize: 22, color: 'var(--yellow-500)' }}>✦</span>
      <span style={{ position: 'absolute', bottom: 30, left: 24, fontSize: 14, color: 'var(--yellow-500)' }}>✦</span>
    </div>
  )
}
