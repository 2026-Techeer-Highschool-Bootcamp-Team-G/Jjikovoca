import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavigationBar, Button } from '@/shared/ui'
import { FlipCard } from '@/widgets/recent-cards'
import { saveCards } from '@/entities/card'
import type { RecentCard } from '@/entities/card'

interface Props {
  isMath: boolean
  onBack: () => void
}

// 촬영·분석 결과 카드(데모) — 수학은 사고 단계 1~n + 정답이 뒷면에
function buildCard(isMath: boolean): RecentCard {
  const id = Date.now()
  if (isMath) {
    return {
      id,
      type: 'PROBLEM',
      problem: 'x² − 5x + 6 = 0 의 두 근을 구하시오.',
      answer: '2, 3',
      steps: [
        '무엇을 구하는 문제인지 파악한다 — 이차방정식의 두 근',
        '곱해서 6, 더해서 5가 되는 두 수를 찾는다',
        '(x − 2)(x − 3) = 0 으로 인수분해한다',
        'x = 2 또는 x = 3, 원식에 대입해 검산한다',
      ],
    }
  }
  return {
    id,
    type: 'WORD',
    word: 'sound',
    pronunciation: '[saʊnd]',
    emoji: '⚖️',
    pos: '형용사',
    meaning: '타당한, 믿을 만한',
    example: 'Her argument was sound and convincing.',
  }
}

// 분석 완료 (130:905) — 생성된 카드(플립) + 오답노트 저장 + 토스식 축하
export function AnalysisResult({ isMath, onBack }: Props) {
  const navigate = useNavigate()
  const [card] = useState(() => buildCard(isMath))
  const [celebrating, setCelebrating] = useState(false)

  const save = () => {
    if (celebrating) return
    saveCards([card]) // 오답노트 기본 저장 + 홈 캐러셀 연동
    setCelebrating(true)
    window.setTimeout(() => navigate('/'), 1500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-secondary)' }}>
      <NavigationBar title={isMath ? '수학 카드' : '영어 카드'} onBack={onBack} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: '16px var(--spacing-xl)' }}>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>
          ✨ AI가 카드를 만들었어요 — 탭해서 {isMath ? '사고 단계·정답' : '뜻'}을 확인해요
        </p>
        <FlipCard card={card} height={380} />
      </div>

      <div style={{ padding: '0 var(--spacing-xl) 24px' }}>
        <Button block size="lg" onClick={save} disabled={celebrating}>
          오답노트에 저장
        </Button>
      </div>

      {celebrating && <SaveCelebration isMath={isMath} />}
    </div>
  )
}

// 컨페티 조각 — 중심에서 바깥으로 튀어 흩어진다
const CONFETTI = [
  { tx: '-70px', ty: '-56px', r: '-140deg', c: 'var(--color-brand-primary)', d: '0.12s' },
  { tx: '66px', ty: '-62px', r: '160deg', c: '#f5a623', d: '0.18s' },
  { tx: '-84px', ty: '8px', r: '-90deg', c: '#1bc1bd', d: '0.1s' },
  { tx: '86px', ty: '0px', r: '120deg', c: '#e5484d', d: '0.22s' },
  { tx: '-44px', ty: '64px', r: '-60deg', c: '#f5a623', d: '0.26s' },
  { tx: '50px', ty: '68px', r: '90deg', c: 'var(--color-brand-primary)', d: '0.16s' },
  { tx: '6px', ty: '-88px', r: '40deg', c: '#1bc1bd', d: '0.2s' },
  { tx: '-8px', ty: '86px', r: '-30deg', c: '#e5484d', d: '0.14s' },
] as const

// 저장 성취 오버레이 — 스프링 팝 + 컨페티 (토스식)
function SaveCelebration({ isMath }: { isMath: boolean }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(15,20,30,0.55)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        animation: 'omc-overlay-in 0.2s ease-out',
      }}
    >
      <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {CONFETTI.map((p, i) => (
          <span
            key={i}
            style={
              {
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 9,
                height: 9,
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
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: 'var(--color-success-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 50,
            animation: 'jjik-pop-spring 0.6s cubic-bezier(0.2,0.9,0.3,1.2) both',
          }}
        >
          🎉
        </div>
      </div>
      <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--common-white, #fff)', animation: 'jjik-rise-in 0.5s ease-out 0.2s both' }}>
        오답노트에 저장 완료!
      </span>
      <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', animation: 'jjik-rise-in 0.5s ease-out 0.3s both' }}>
        {isMath ? '수학' : '영어'} 카드 +5 XP · 홈에서 바로 확인해요
      </span>
    </div>
  )
}
