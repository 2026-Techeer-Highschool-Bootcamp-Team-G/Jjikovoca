import { useState } from 'react'

const CHIP_GRADIENT = 'linear-gradient(180deg, #ffea7a, #ffd84d)'

type Subject = 'ENGLISH' | 'MATH'

// F-03 v1.7 — 분석 로딩 동기부여 문구 풀(초기 7종, 프론트 로컬 상수). 매 진입 랜덤 표시.
const QUOTES = [
  '"오늘의 1시간이 내일의 후회를 없앤다"',
  '"남들 놀 때 하는 공부가 진짜 실력 차이를 만든다"',
  '"포기하는 순간 그동안의 노력이 아까워진다"',
  '"성적은 배신하지 않는다, 노력한 만큼 나온다"',
  '"지금 흘린 땀이 나중에 웃을 이유가 된다"',
  '"하기 싫을 때 하는 사람이 결국 이긴다"',
  '"시작이 반이다, 일단 책을 펴자"',
]

const CONTENT: Record<
  Subject,
  {
    emoji: string
    title: string
    subtitle: [string, string]
    chips: string[]
    countNote: string
    quota: string
  }
> = {
  ENGLISH: {
    emoji: '✨',
    title: '문맥을 읽고 있어요',
    subtitle: ['AI가 지문 전체를 읽고 형광펜 친 단어의', '"이 지문에서의 뜻"을 찾는 중 · 최대 10초'],
    chips: ['sound', 'take charge of', 'urgent'],
    countNote: '단어 3개 · AI 호출은 1회만 차감돼요',
    quota: '오늘 무료 분석 3 / 5회 사용',
  },
  MATH: {
    emoji: '🧠',
    title: '사고의 단계를 만들고 있어요',
    subtitle: ['필기와 인쇄 원문을 구분해 읽고,', '풀이 과정을 사고 단계로 정리하는 중 · 최대 10초'],
    chips: ['원문 추출 ✓', '사고 단계 구성 중…', '풀이 진단'],
    countNote: '문제 1개 · AI 호출은 1회만 차감돼요',
    quota: '오늘 무료 분석 4 / 5회 사용',
  },
}

// AI 분석 중 (26:231 / 05-8 80:663) — 문맥 읽는 로딩 + 동기부여 문구(F-03 v1.7) + 진행 칩 + 무료 쿼터
export function AnalyzingView({ subject = 'ENGLISH' }: { subject?: Subject }) {
  const c = CONTENT[subject]
  // 진입 시 7종 풀에서 랜덤 1개 고정 (렌더마다 바뀌지 않도록 초기화 함수 사용)
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, var(--color-brand-weak) 0%, var(--color-bg-primary) 55%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '80px var(--spacing-xl) 24px',
        gap: 0,
      }}
    >
      <AnalyzingOrb emoji={c.emoji} />

      <h1 style={{ margin: '24px 0 12px', fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>
        {c.title}
      </h1>
      <p style={{ margin: 0, textAlign: 'center', fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
        {c.subtitle[0]}
        <br />
        {c.subtitle[1]}
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 28 }}>
        {c.chips.map((w, i) => (
          <span
            key={w}
            style={{
              background: CHIP_GRADIENT,
              color: 'var(--yellow-900)',
              fontSize: 13,
              fontWeight: 500,
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              animation: 'jjik-highlight-shimmer 1.5s ease-in-out infinite',
              animationDelay: `${i * 0.4}s`,
            }}
          >
            {w}
          </span>
        ))}
      </div>
      <p style={{ margin: '12px 0 0', fontSize: 12, color: 'var(--color-text-tertiary)' }}>{c.countNote}</p>

      <div style={{ flex: 1 }} />

      <div
        style={{
          width: '100%',
          background: 'var(--color-brand-weak)',
          borderRadius: 12,
          padding: '12px 18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 5,
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text-tertiary)' }}>💬 오늘의 한마디</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', textAlign: 'center' }}>
          {quote}
        </span>
      </div>

      <div
        style={{
          width: '100%',
          height: 44,
          borderRadius: 12,
          background: 'var(--color-bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          color: 'var(--color-text-secondary)',
        }}
      >
        {c.quota}
      </div>
    </div>
  )
}

// AI 분석 중 오브(토스식) — 숨쉬는 글로우 + 회전 스캔 링 + 궤도 스파클 + 둥실 떠오르는 글리프
function AnalyzingOrb({ emoji }: { emoji: string }) {
  return (
    <div style={{ position: 'relative', width: 200, height: 200 }} aria-hidden>
      {/* 숨쉬는 방사형 글로우 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0) 68%)',
          animation: 'jjik-breathe 2.6s ease-in-out infinite',
        }}
      />
      {/* 회전 스캔 링 (conic + 마스크로 도넛) */}
      <div
        style={{
          position: 'absolute',
          inset: 22,
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, rgba(49,130,246,0) 0%, rgba(49,130,246,0.65) 28%, rgba(49,130,246,0) 55%)',
          WebkitMaskImage: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          maskImage: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          animation: 'jjik-spin 1.7s linear infinite',
        }}
      />
      {/* 궤도 스파클 3개 — 각기 다른 시작 각도/속도로 공전 */}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: 'absolute', inset: 0, animation: 'jjik-spin 3.4s linear infinite', animationDelay: `${-i * 1.13}s` }}>
          <span
            style={{
              position: 'absolute',
              top: 4,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: i === 1 ? 16 : 12,
              color: '#ffd84d',
              filter: 'drop-shadow(0 0 4px rgba(255,216,77,0.85))',
              animation: 'jjik-twinkle 1s ease-in-out infinite',
            }}
          >
            ✦
          </span>
        </div>
      ))}
      {/* 둥실 떠오르는 중앙 글리프 */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 60, animation: 'jjik-float 2.2s ease-in-out infinite' }}>{emoji}</span>
      </div>
    </div>
  )
}
