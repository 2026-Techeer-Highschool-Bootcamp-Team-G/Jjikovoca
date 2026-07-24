import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { IconSpeaker } from '@/shared/ui'
import { fetchCards, cardToRecent } from '@/entities/card'
import type { FeedSubject, RecentCard } from '@/entities/card'

const CARD_H = 300

/** 홈 최근 카드 — 좌우 스와이프 캐러셀 + 탭 플립(영어=뜻 / 수학=풀이). 실 카드(/api/cards) */
export function RecentCarousel({ subject = 'ALL' }: { subject?: FeedSubject }) {
  const { data, isLoading } = useQuery({
    queryKey: ['cards', subject],
    queryFn: () => fetchCards(subject),
  })
  const cards = (data ?? []).map(cardToRecent)

  if (cards.length === 0) {
    return (
      <p style={{ margin: '24px var(--spacing-xl)', textAlign: 'center', fontSize: 13, color: 'var(--color-text-tertiary)' }}>
        {isLoading ? '카드를 불러오는 중…' : '아직 카드가 없어요 — 시험지를 촬영해 첫 카드를 만들어보세요'}
      </p>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        // 카드를 화면 중앙에 정렬 — 좌우 균등 peek. (100% - 84%)/2 만큼 좌우 여백
        padding: '4px calc((100% - 84%) / 2) 8px',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {cards.map((c) => (
        <div key={c.id} style={{ flex: '0 0 84%', scrollSnapAlign: 'center' }}>
          <FlipCard card={c} />
        </div>
      ))}
    </div>
  )
}

export function FlipCard({ card, height = CARD_H }: { card: RecentCard; height?: number }) {
  const [flipped, setFlipped] = useState(false)
  const isWord = card.type === 'WORD'
  return (
    <div style={{ perspective: 1000, height }}>
      <div
        onClick={() => setFlipped((f) => !f)}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.3, 1)',
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'none',
          cursor: 'pointer',
        }}
      >
        <Face>{isWord ? <WordFront card={card} /> : <ProblemFront card={card} />}</Face>
        <Face back>{isWord ? <WordBack card={card} /> : <ProblemBack card={card} />}</Face>
      </div>
    </div>
  )
}

function Face({ children, back = false }: { children: ReactNode; back?: boolean }) {
  const style: CSSProperties = {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transform: back ? 'rotateY(180deg)' : undefined,
    background: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 20,
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }
  return <div style={style}>{children}</div>
}

const chip = (color: string, bg: string): CSSProperties => ({
  display: 'inline-flex',
  alignSelf: 'flex-start',
  fontSize: 11,
  fontWeight: 700,
  padding: '3px 9px',
  borderRadius: 999,
  color,
  background: bg,
})

const tapHint: CSSProperties = { marginTop: 'auto', textAlign: 'center', fontSize: 12, color: 'var(--color-text-tertiary)' }

function WordFront({ card }: { card: RecentCard }) {
  return (
    <>
      <CardTags card={card} />
      {card.emoji && (
        <div
          style={{
            marginTop: 10,
            width: '100%',
            height: 78,
            borderRadius: 12,
            background: 'linear-gradient(90deg, #e8f3ff 0%, #e7f8f8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 40, lineHeight: 1 }} aria-hidden>
            {card.emoji}
          </span>
        </div>
      )}
      <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text-primary)' }}>{card.word}</span>
        {card.pronunciation && (
          <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>{card.pronunciation}</span>
        )}
      </div>
      <div style={{ marginTop: 10 }}>
        <AudioButtons text={card.word ?? ''} />
      </div>
      <span style={tapHint}>탭하면 뜻이 보여요</span>
    </>
  )
}

function WordBack({ card }: { card: RecentCard }) {
  return (
    <>
      <span style={chip('var(--color-text-brand)', 'var(--color-brand-weak)')}>뜻</span>
      <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
        {card.pos && <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>{card.pos}</span>}
        <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>{card.meaning ?? '뜻 정보 없음'}</span>
        {card.example && (
          <span style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>“{card.example}”</span>
        )}
      </div>
      <span style={tapHint}>탭하면 단어로 돌아가요</span>
    </>
  )
}

function ProblemFront({ card }: { card: RecentCard }) {
  return (
    <>
      <CardTags card={card} />
      <div style={{ margin: 'auto 0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
        <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.5, color: 'var(--color-text-primary)', textAlign: 'center' }}>
          {card.problem}
        </span>
      </div>
      <span style={tapHint}>탭하면 정답이 보여요</span>
    </>
  )
}

function ProblemBack({ card }: { card: RecentCard }) {
  const steps = card.steps ?? []
  // 정답·사고 단계는 학습 판정 시에만 서버가 준다(비노출 계약) → 카드 뒷면엔 개념/요약 + 학습 유도
  if (steps.length === 0 && card.answer == null) {
    return (
      <>
        <span style={chip('var(--blue-500)', 'rgba(49,130,246,0.12)')}>문제 요약</span>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center', padding: '0 4px' }}>
          {card.solution && (
            <span style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>{card.solution}</span>
          )}
          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
            학습을 시작하면 사고 단계와 정답을 볼 수 있어요
          </span>
        </div>
        <span style={tapHint}>탭하면 문제로 돌아가요</span>
      </>
    )
  }
  return (
    <>
      <span style={chip('var(--blue-500)', 'rgba(49,130,246,0.12)')}>사고 단계 + 정답</span>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, margin: '10px 0 6px' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span
              style={{
                flexShrink: 0,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'var(--blue-500)',
                color: 'var(--color-text-inverse)',
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {i + 1}
            </span>
            <span style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--color-text-secondary)', textAlign: 'left' }}>{s}</span>
          </div>
        ))}
        {steps.length === 0 && card.solution && (
          <span style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-secondary)', textAlign: 'center' }}>{card.solution}</span>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '10px 0',
          borderTop: '1px dashed var(--color-border-default)',
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>정답</span>
        <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--blue-500)' }}>{card.answer}</span>
      </div>
      <span style={tapHint}>탭하면 문제로 돌아가요</span>
    </>
  )
}

// 유형·특성 태그 + 시험 정보 태그 — 홈/오답노트 앞면 공용
function CardTags({ card }: { card: RecentCard }) {
  const tags = card.tags ?? []
  const exams = card.exams ?? []
  if (!tags.length && !exams.length) return null
  return (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
      {tags.map((t) => (
        <span key={t.label} style={tagChip(t.tone)}>
          {t.label}
        </span>
      ))}
      {exams.map((e) => (
        <span key={e} style={examChip}>
          📅 {e}
        </span>
      ))}
    </div>
  )
}

const tagChip = (tone: 'grey' | 'blue'): CSSProperties => ({
  fontSize: 10,
  fontWeight: 500,
  padding: '2px 8px',
  borderRadius: 6,
  whiteSpace: 'nowrap',
  background: tone === 'blue' ? 'var(--color-brand-weak)' : 'var(--color-bg-secondary)',
  color: tone === 'blue' ? 'var(--color-text-brand)' : 'var(--color-text-secondary)',
})

const examChip: CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  padding: '2px 8px',
  borderRadius: 999,
  whiteSpace: 'nowrap',
  background: 'var(--color-brand-weak)',
  color: 'var(--color-brand-primary)',
}

// 발음 재생 — 카드 플립과 겹치지 않게 stopPropagation
function speak(text: string, lang: string) {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined
  if (!synth || !text) return
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang
  synth.speak(u)
}

// 미국/영국 발음 선택 재생 (카드 앞면)
function AudioButtons({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      <button type="button" onClick={(e) => { e.stopPropagation(); speak(text, 'en-US') }} style={audioBtn(true)}>
        🇺🇸 미국 <IconSpeaker size={13} />
      </button>
      <button type="button" onClick={(e) => { e.stopPropagation(); speak(text, 'en-GB') }} style={audioBtn(false)}>
        🇬🇧 영국 <IconSpeaker size={13} />
      </button>
    </div>
  )
}

const audioBtn = (primary: boolean): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: '6px 12px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
  background: primary ? 'var(--color-brand-weak)' : 'var(--color-bg-primary)',
  color: primary ? 'var(--color-text-brand)' : 'var(--color-text-secondary)',
  border: primary ? '1px solid transparent' : '1px solid var(--color-border-default)',
})
