import { useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui'

const GRADIENT = 'linear-gradient(180deg, #fff9e6 0%, #fffdf6 46%, #ffffff 100%)'
const HL = 'var(--color-accent)' // 형광펜 옐로
const HL_STRONG = 'var(--color-accent-strong)'

const mark: CSSProperties = { background: 'linear-gradient(transparent 55%, var(--color-accent) 55%)', padding: '0 3px', borderRadius: 2 }

interface Step {
  art: ReactNode
  title: ReactNode
  desc: ReactNode
}

/** 온보딩 (F-01) — 4스텝 스와이프(촬영→형광펜→AI카드→복습). 마지막 '시작하기' → 로그인 */
export function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const touchX = useRef<number | null>(null)

  const steps: Step[] = [
    { art: <ShotArt />, title: <>시험지를 <span style={{ color: 'var(--color-brand-primary)' }}>찍기만</span> 하면</>, desc: <>카메라로 시험지를 찍고<br />종이 프레임에 맞춰 촬영하세요.</> },
    { art: <PenArt />, title: <>모르는 단어에<br /><span style={{ color: 'var(--color-brand-primary)' }}>형광펜만</span> 쓱.</>, desc: <>외우고 싶은 단어 위를<br />형광펜으로 긋기만 하면 돼요.</> },
    { art: <CardArt />, title: <>AI가 <span style={{ color: 'var(--color-brand-primary)' }}>나만의 카드</span>로</>, desc: <>지문 속 진짜 뜻, 예문, 발음까지<br />자동으로 오답노트가 완성돼요.</> },
    { art: <ReviewArt />, title: <><span style={{ color: 'var(--color-brand-primary)' }}>게임처럼</span> 복습해요.</>, desc: <>플래시카드·빈칸퀴즈로 콤보를 쌓고<br />매일 잔디를 채우며 외워요.</> },
  ]
  const last = steps.length - 1

  const go = (s: number) => setStep(Math.max(0, Math.min(last, s)))
  const onNext = () => {
    if (step < last) go(step + 1)
    else finish()
  }
  const finish = () => {
    // 온보딩 노출 여부는 인증 상태로만 판단한다(RequireAuth) — 로그인 전이면 항상 온보딩
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: GRADIENT, overflow: 'hidden' }}>
      {/* 상단 — 뒤로 / 로고 / 건너뛰기 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', height: 52 }}>
        <button
          type="button"
          aria-label="이전"
          onClick={() => go(step - 1)}
          style={{ fontSize: 22, lineHeight: 1, color: 'var(--color-text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', visibility: step === 0 ? 'hidden' : 'visible' }}
        >
          ‹
        </button>
        <span style={{ fontSize: 15, fontWeight: 800 }}>
          <span style={mark}>찍어보카</span>
        </span>
        <button type="button" onClick={finish} style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>
          건너뛰기
        </button>
      </div>

      {/* 진행 도트 */}
      <div style={{ display: 'flex', gap: 7, justifyContent: 'center', margin: '2px 0 6px' }}>
        {steps.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${i + 1}단계`}
            onClick={() => go(i)}
            style={{ width: i === step ? 22 : 7, height: 7, borderRadius: 999, border: 'none', padding: 0, cursor: 'pointer', background: i === step ? HL_STRONG : '#e5e0cf', transition: 'all 0.3s' }}
          />
        ))}
      </div>

      {/* 슬라이드 트랙 */}
      <div
        style={{ flex: 1, overflow: 'hidden' }}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current == null) return
          const dx = e.changedTouches[0].clientX - touchX.current
          if (Math.abs(dx) > 40) go(step + (dx < 0 ? 1 : -1))
          touchX.current = null
        }}
      >
        <div style={{ display: 'flex', width: `${steps.length * 100}%`, height: '100%', transform: `translateX(-${step * (100 / steps.length)}%)`, transition: 'transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ width: `${100 / steps.length}%`, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 30px', textAlign: 'center' }}>
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>{s.art}</div>
              <div style={{ marginTop: 34 }}>
                <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.6px', lineHeight: 1.32, color: 'var(--color-text-primary)' }}>{s.title}</div>
                <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.62, color: 'var(--color-text-secondary)' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div style={{ padding: '0 24px 34px' }}>
        <Button block size="lg" onClick={onNext}>
          {step === last ? '찍어보카 시작하기' : '다음'}
        </Button>
        <button
          type="button"
          onClick={finish}
          style={{ display: 'block', width: '100%', marginTop: 12, height: 18, fontSize: 13, color: 'var(--color-text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', visibility: step === 0 ? 'visible' : 'hidden' }}
        >
          이미 계정이 있어요
        </button>
      </div>
    </div>
  )
}

const cardShadow = '0 18px 40px rgba(80,70,20,0.14)'

// 1. 촬영 — 폰 프레임 + 촬영 브래킷 + 셔터
function ShotArt() {
  const brk = (pos: CSSProperties): CSSProperties => ({ position: 'absolute', width: 26, height: 26, border: `3px solid ${HL}`, ...pos })
  return (
    <div style={{ width: 190, height: 230, borderRadius: 22, background: '#20242c', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 44px rgba(0,0,0,0.25)' }} aria-hidden>
      <div style={{ width: 140, height: 170, background: '#fff', borderRadius: 8, padding: '14px 12px' }}>
        <Line /><Line />
        <div style={{ margin: '9px 0', fontSize: 11 }}>
          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, padding: '0 3px', background: HL, borderRadius: 2 }}>mercy</span> is…
        </div>
        <Line /><Line w="60%" />
      </div>
      <span style={brk({ top: 24, left: 24, borderRight: 0, borderBottom: 0, borderRadius: '6px 0 0 0' })} />
      <span style={brk({ top: 24, right: 24, borderLeft: 0, borderBottom: 0, borderRadius: '0 6px 0 0' })} />
      <span style={brk({ bottom: 24, left: 24, borderRight: 0, borderTop: 0, borderRadius: '0 0 0 6px' })} />
      <span style={brk({ bottom: 24, right: 24, borderLeft: 0, borderTop: 0, borderRadius: '0 0 6px 0' })} />
      <span style={{ position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)', width: 52, height: 52, borderRadius: '50%', background: '#fff', border: '4px solid var(--color-brand-primary)', boxShadow: '0 8px 18px rgba(49,130,246,0.35)' }} />
    </div>
  )
}

// 2. 형광펜 — 시험지 + 단어 sweep 밑줄 + 형광펜
function PenArt() {
  return (
    <div style={{ width: 230, padding: '22px 20px', transform: 'rotate(-3deg)', position: 'relative', background: '#fff', borderRadius: 20, boxShadow: cardShadow }} aria-hidden>
      <Spark style={{ top: -12, left: 8 }} />
      <Spark style={{ top: 18, right: 12, fontSize: 12, animationDelay: '0.3s' }} />
      <Line />
      <div style={{ margin: '14px 0' }}>
        <span style={{ position: 'relative', display: 'inline-block', fontSize: 16, fontWeight: 800, padding: '0 2px' }}>
          mercy
          <span style={{ position: 'absolute', left: -2, right: -2, bottom: 1, height: 11, background: HL, borderRadius: 3, zIndex: -1, transformOrigin: 'left', animation: 'jjik-hl-sweep 1.9s ease-in-out infinite' }} />
        </span>{' '}
        means kindness…
      </div>
      <Line /><Line w="70%" />
      <span style={{ position: 'absolute', right: -14, bottom: -10, fontSize: 40, transform: 'rotate(12deg)', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.18))' }}>🖍️</span>
    </div>
  )
}

// 3. AI 카드 — 플래시카드 + AI 뱃지
function CardArt() {
  return (
    <div style={{ width: 200, overflow: 'hidden', background: '#fff', borderRadius: 20, boxShadow: cardShadow, position: 'relative' }} aria-hidden>
      <span style={{ position: 'absolute', top: 8, right: 16, fontSize: 11, fontWeight: 800, color: '#fff', background: 'var(--color-brand-primary)', borderRadius: 999, padding: '4px 10px', boxShadow: '0 6px 14px rgba(49,130,246,0.35)', animation: 'jjik-pop-spring 0.5s cubic-bezier(0.2,0.9,0.3,1.2) both' }}>✨ AI</span>
      <div style={{ height: 80, background: 'linear-gradient(90deg, #e8f3ff, #e7f8f8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34 }}>💡</div>
      <div style={{ padding: '14px 16px 16px', textAlign: 'left' }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>mercy</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 1 }}>/ˈmɜːrsi/</div>
        <div style={{ display: 'flex', gap: 5, margin: '9px 0' }}>
          {['수능', '명사'].map((t) => (
            <span key={t} style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-brand-primary)', background: 'var(--color-brand-weak)', borderRadius: 999, padding: '2px 8px' }}>{t}</span>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.5, background: 'var(--color-bg-secondary)', borderRadius: 9, padding: '8px 10px' }}>
          He showed <b>mercy</b> to them.<br />
          <span style={{ color: 'var(--color-text-tertiary)' }}>그는 그들에게 자비를 베풀었다.</span>
        </div>
      </div>
    </div>
  )
}

// 4. 복습 — 콤보 불꽃 + XP + 미니 잔디
function ReviewArt() {
  const grass = ['', '', 'g1', 'g2', 'g3', 'g2', 'g1', 'g2', 'g3', 'g2', 'g1', 'g3', 'g2', '']
  const gcolor: Record<string, string> = { g1: '#9be9a8', g2: '#40c463', g3: '#30a14e' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }} aria-hidden>
      <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--color-on-accent)', background: `linear-gradient(135deg, ${HL}, ${HL_STRONG})`, padding: '8px 16px', borderRadius: 999, boxShadow: '0 8px 18px rgba(245,182,56,0.4)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ display: 'inline-block', animation: `jjik-flame ${0.7}s ease-in-out ${i * 0.12}s infinite` }}>🔥</span>
        ))}
        &nbsp;5콤보
      </span>
      <span style={{ fontSize: 13, fontWeight: 800, color: '#0a8a55', background: 'rgba(10,138,85,0.12)', padding: '5px 12px', borderRadius: 999 }}>+15 XP</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 15px)', gap: 4, marginTop: 2 }}>
        {grass.map((g, i) => (
          <span key={i} style={{ width: 15, height: 15, borderRadius: 4, background: g ? gcolor[g] : '#eef1f4' }} />
        ))}
      </div>
    </div>
  )
}

// 공통 — 시험지 줄, 스파클
function Line({ w = '100%' }: { w?: string }) {
  return <div style={{ height: 9, borderRadius: 5, background: '#eef1f4', margin: '12px 0', width: w }} />
}
function Spark({ style }: { style: CSSProperties }) {
  return <span style={{ position: 'absolute', color: HL_STRONG, animation: 'jjik-twinkle 1.4s ease-in-out infinite', ...style }}>✦</span>
}
