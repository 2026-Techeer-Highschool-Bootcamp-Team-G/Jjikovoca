import type { CSSProperties } from 'react'
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
            animation: 'jjik-rise-in 0.5s ease-out 0.2s both',
          }}
        >
          Box 4 졸업 🎓
        </span>
        <h1
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            animation: 'jjik-rise-in 0.5s ease-out 0.3s both',
          }}
        >
          ‘sound’ 카드 졸업!
        </h1>
        <p
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: 15,
            lineHeight: 1.5,
            color: 'var(--color-text-secondary)',
            animation: 'jjik-rise-in 0.5s ease-out 0.4s both',
          }}
        >
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

// 축하 컨페티 조각 — 중심에서 바깥으로 튀어 흩어진다
const CONFETTI = [
  { tx: '-64px', ty: '-52px', r: '-140deg', c: 'var(--color-brand-primary)', d: '0.15s' },
  { tx: '58px', ty: '-58px', r: '160deg', c: '#f5a623', d: '0.2s' },
  { tx: '-78px', ty: '10px', r: '-90deg', c: '#1bc1bd', d: '0.1s' },
  { tx: '80px', ty: '2px', r: '120deg', c: '#e5484d', d: '0.25s' },
  { tx: '-40px', ty: '58px', r: '-60deg', c: '#f5a623', d: '0.28s' },
  { tx: '46px', ty: '62px', r: '90deg', c: 'var(--color-brand-primary)', d: '0.18s' },
  { tx: '6px', ty: '-82px', r: '40deg', c: '#1bc1bd', d: '0.22s' },
  { tx: '-8px', ty: '80px', r: '-30deg', c: '#e5484d', d: '0.12s' },
] as const

// graphic/graduation (16:18) — 노란 원 배경 + 졸업모 스프링 팝 + 컨페티 + 반짝임
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
      {CONFETTI.map((p, i) => (
        <span
          key={i}
          style={
            {
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 8,
              height: 8,
              borderRadius: 2,
              background: p.c,
              '--tx': p.tx,
              '--ty': p.ty,
              '--r': p.r,
              animation: `jjik-confetti-burst 0.9s ease-out ${p.d} both`,
            } as CSSProperties
          }
        />
      ))}
      <span style={{ fontSize: 72, lineHeight: 1, animation: 'jjik-pop-spring 0.6s cubic-bezier(0.2,0.9,0.3,1.2) both' }}>
        🎓
      </span>
      <span
        style={{ position: 'absolute', top: 24, right: 26, fontSize: 22, color: 'var(--yellow-500)', animation: 'jjik-twinkle 1.4s ease-in-out 0.5s infinite' }}
      >
        ✦
      </span>
      <span
        style={{ position: 'absolute', bottom: 30, left: 24, fontSize: 14, color: 'var(--yellow-500)', animation: 'jjik-twinkle 1.4s ease-in-out 0.8s infinite' }}
      >
        ✦
      </span>
    </div>
  )
}
