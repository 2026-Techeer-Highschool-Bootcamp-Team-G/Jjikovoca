import { useState, useSyncExternalStore } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { IconSpeaker } from '@/shared/ui'
import { getSavedCards, subscribeSavedCards } from '@/entities/card'
import type { RecentCard } from '@/entities/card'

// 저장 카드 구독 — 캡처로 저장한 카드가 홈 캐러셀 앞에 연동됨
function useSavedCards(): RecentCard[] {
  return useSyncExternalStore(subscribeSavedCards, getSavedCards, getSavedCards)
}

// 최근 카드 데모 — 영어(단어) + 수학(문제) 혼합. 탭하면 뒷면(뜻/정답)
const CARDS: RecentCard[] = [
  { id: 1, type: 'WORD', word: 'sound', pronunciation: '[saʊnd]', emoji: '⚖️', pos: '형용사', meaning: '타당한, 믿을 만한', example: 'Her argument was sound and convincing.' },
  { id: 2, type: 'PROBLEM', problem: 'x² − 5x + 6 = 0 의 두 근을 구하시오.', answer: '2, 3', solution: '곱해서 6, 더해서 5 → (x−2)(x−3)=0' },
  { id: 3, type: 'WORD', word: 'plant', pronunciation: '[plænt]', emoji: '🏭', pos: '명사', meaning: '공장, 설비', example: 'They built a new car plant.' },
  { id: 4, type: 'PROBLEM', problem: '2x + 3 = 11 일 때 x = ?', answer: '4', solution: '2x = 8 → x = 4' },
  { id: 5, type: 'WORD', word: 'charge', pronunciation: '[tʃɑːrdʒ]', emoji: '💰', pos: '명사·동사', meaning: '책임; 요금; 청구하다', example: 'She took charge of the project.' },
  { id: 6, type: 'PROBLEM', problem: '3² + 4² = ?', answer: '25', solution: '9 + 16 = 25' },
  { id: 7, type: 'WORD', word: 'bank', pronunciation: '[bæŋk]', emoji: '🏦', pos: '명사', meaning: '은행; 강둑', example: 'We sat on the river bank.' },
  { id: 8, type: 'PROBLEM', problem: 'x² = 49 일 때 x = ?', answer: '7, −7', solution: 'x = ±√49 = ±7' },
  { id: 9, type: 'WORD', word: 'light', pronunciation: '[laɪt]', emoji: '💡', pos: '형용사·명사', meaning: '가벼운; 빛', example: 'The bag was surprisingly light.' },
  { id: 10, type: 'PROBLEM', problem: '√144 = ?', answer: '12', solution: '12 × 12 = 144' },
  { id: 11, type: 'WORD', word: 'spring', pronunciation: '[sprɪŋ]', emoji: '🌱', pos: '명사', meaning: '봄; 용수철; 샘', example: 'The spring water was cold.' },
  { id: 12, type: 'PROBLEM', problem: '1/2 + 1/3 = ?', answer: '5/6', solution: '3/6 + 2/6 = 5/6' },
  { id: 13, type: 'WORD', word: 'novel', pronunciation: '[ˈnɑːvl]', emoji: '📖', pos: '형용사·명사', meaning: '새로운; 소설', example: 'It was a novel approach.' },
  { id: 14, type: 'PROBLEM', problem: '2⁵ = ?', answer: '32', solution: '2×2×2×2×2 = 32' },
  { id: 15, type: 'WORD', word: 'current', pronunciation: '[ˈkɜːrənt]', emoji: '🌊', pos: '형용사·명사', meaning: '현재의; 해류', example: 'the current situation' },
  { id: 16, type: 'PROBLEM', problem: '삼각형 세 내각의 합은?', answer: '180°', solution: '평면 삼각형의 내각 합은 180°' },
  { id: 17, type: 'WORD', word: 'subject', pronunciation: '[ˈsʌbdʒɪkt]', emoji: '📚', pos: '명사', meaning: '주제; 과목', example: 'a difficult subject to explain' },
  { id: 18, type: 'PROBLEM', problem: '15의 20% 는?', answer: '3', solution: '15 × 0.2 = 3' },
  { id: 19, type: 'WORD', word: 'capital', pronunciation: '[ˈkæpɪtl]', emoji: '🏛️', pos: '명사', meaning: '수도; 자본; 대문자', example: 'Seoul is the capital of Korea.' },
  { id: 20, type: 'PROBLEM', problem: 'y = 2x + 1, x = 3 일 때 y = ?', answer: '7', solution: 'y = 2×3 + 1 = 7' },
  { id: 21, type: 'WORD', word: 'fair', pronunciation: '[fer]', emoji: '⚖️', pos: '형용사·명사', meaning: '공정한; 박람회', example: 'a fair decision for everyone' },
  { id: 22, type: 'PROBLEM', problem: '12 × 8 = ?', answer: '96', solution: '12 × 8 = 96' },
]

const CARD_H = 300

// 데모 카드에 기본 유형·시험 태그 부여(저장 카드는 자체 태그 사용)
function decorate(c: RecentCard): RecentCard {
  const tags =
    c.tags ??
    (c.type === 'WORD'
      ? [{ label: c.pos ?? '단어', tone: 'grey' as const }, { label: '다의어', tone: 'blue' as const }]
      : [{ label: '수학', tone: 'grey' as const }, { label: '개념', tone: 'blue' as const }])
  return { ...c, tags, exams: c.exams ?? ['중간고사'] }
}
const DECORATED = CARDS.map(decorate)

/** 홈 최근 카드 — 좌우 스와이프 캐러셀 + 탭 플립(영어=뜻 / 수학=정답). 저장 카드가 앞에 연동 */
export function RecentCarousel({ subject = 'ALL' }: { subject?: 'ALL' | 'ENGLISH' | 'MATH' }) {
  const saved = useSavedCards()
  const all = [...saved, ...DECORATED]
  const cards = all.filter(
    (c) => subject === 'ALL' || (subject === 'ENGLISH' ? c.type === 'WORD' : c.type === 'PROBLEM'),
  )
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        padding: '4px var(--spacing-xl) 8px',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {cards.map((c) => (
        <div key={c.id} style={{ flex: '0 0 84%', scrollSnapAlign: 'start' }}>
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
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text-primary)' }}>{card.word}</span>
        <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>{card.pronunciation}</span>
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
        <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>{card.pos}</span>
        <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>{card.meaning}</span>
        <span style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>“{card.example}”</span>
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
