import { useState } from 'react'
import type { CSSProperties } from 'react'
import { IconSpeaker } from '@/shared/ui'

/** 홈·게임 공용 플래시카드 모델 (정규화). 앞면=예문+해석, 뒷면=단어 아래 뜻(형광펜) */
export interface FlashCardModel {
  word: string
  pronunciation?: string
  imageUrl?: string | null // AI 연상 이미지 URL(mediaUrl 적용 완료). 없으면 emoji 폴백
  emoji?: string
  tags?: { label: string; tone: 'grey' | 'blue' }[]
  example?: string // 영어 예문
  exampleTranslation?: string // 예문 해석(한글) — 없으면 숨김
  meaning?: string // 뜻(뒷면, 단어 아래 형광펜 강조)
  pos?: string
}

interface Props {
  card: FlashCardModel
  height?: number
  flipped?: boolean // 지정 시 controlled(게임: 다음 카드에서 리셋). 없으면 내부 토글(홈)
  onFlip?: () => void
  // AI 연상 이미지 온디맨드 생성(게임 전용)
  onGenerate?: () => void
  generating?: boolean
  genError?: boolean
}

const FACE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  background: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-border-default)',
  borderRadius: 20,
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  padding: 18,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  overflow: 'hidden',
}

/** 공용 플래시카드 — 탭하면 3D 플립. 앞: 단어+예문+해석 / 뒤: 단어 아래 뜻(형광펜) */
export function FlashCard({ card, height = 500, flipped, onFlip, onGenerate, generating, genError }: Props) {
  const [inner, setInner] = useState(false)
  const isFlipped = flipped ?? inner
  const toggle = onFlip ?? (() => setInner((f) => !f))

  return (
    <div onClick={toggle} style={{ perspective: 1200, height, cursor: 'pointer' }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.3, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'none',
        }}
      >
        <div style={FACE}>
          <FaceContent card={card} showMeaning={false} img={{ onGenerate, generating, genError }} />
        </div>
        <div style={{ ...FACE, border: '1.5px solid var(--color-brand-primary)', transform: 'rotateY(180deg)' }}>
          <FaceContent card={card} showMeaning img={{ onGenerate, generating, genError }} />
        </div>
      </div>
    </div>
  )
}

interface ImgProps {
  onGenerate?: () => void
  generating?: boolean
  genError?: boolean
}

// 앞/뒤 공통 본문 — showMeaning 이면 단어 바로 아래에 뜻(형광펜) 추가
function FaceContent({ card, showMeaning, img }: { card: FlashCardModel; showMeaning: boolean; img: ImgProps }) {
  return (
    <>
      <ImageArea card={card} img={img} />

      {/* 단어 → (뒷면) 뜻 형광펜 → 발음 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)' }}>{card.word}</span>
        {showMeaning && card.meaning && (
          <span style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.5, color: 'var(--color-text-primary)' }}>
            <mark
              style={{
                background: 'linear-gradient(transparent 55%, var(--color-accent) 55%)',
                color: 'inherit',
                padding: '0 3px',
                borderRadius: 3,
              }}
            >
              {card.meaning}
            </mark>
          </span>
        )}
        {card.pronunciation && (
          <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>{card.pronunciation}</span>
        )}
      </div>

      <VoiceRow word={card.word} />

      {card.tags && card.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {card.tags.map((t) => (
            <Tag key={t.label} label={t.label} tone={t.tone} />
          ))}
        </div>
      )}

      {/* 예문 + 해석 (앞·뒤 공통) */}
      {card.example ? (
        <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)' }}>예문</span>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-primary)' }}>{card.example}</p>
          {card.exampleTranslation && (
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>{card.exampleTranslation}</p>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 0' }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>이 단어와 관련된 예문</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>그 예문의 뜻</span>
        </div>
      )}

      <span style={{ marginTop: 'auto', textAlign: 'center', fontSize: 12, color: 'var(--color-text-tertiary)' }}>
        {showMeaning ? '탭하면 단어로 돌아가요' : '카드를 탭하면 뜻이 보여요'}
      </span>
    </>
  )
}

function ImageArea({ card, img }: { card: FlashCardModel; img: ImgProps }) {
  const { onGenerate, generating, genError } = img
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 104,
        flexShrink: 0,
        borderRadius: 12,
        background: 'linear-gradient(90deg, #e8f3ff 0%, #e7f8f8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {card.imageUrl ? (
        <img src={card.imageUrl} alt="AI 연상 이미지" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <>
          <span style={{ fontSize: 44, lineHeight: 1 }} aria-hidden>
            {card.emoji || '📘'}
          </span>
          {onGenerate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (!generating) onGenerate()
              }}
              disabled={generating}
              style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                fontSize: 11,
                fontWeight: 500,
                padding: '4px 10px',
                borderRadius: 999,
                border: 'none',
                background: 'var(--color-brand-primary)',
                color: 'var(--color-text-inverse)',
                cursor: generating ? 'default' : 'pointer',
                opacity: generating ? 0.7 : 1,
              }}
            >
              {generating ? '생성 중…' : genError ? '다시 생성' : '✨ 이미지 생성'}
            </button>
          )}
        </>
      )}
    </div>
  )
}

// 발음 재생 — 미국/영국 모두 기본 비활성. 클릭한 국가만 재생 동안 파랑 활성(끝나면 회색). 스피커는 미국 기본
function VoiceRow({ word }: { word: string }) {
  const [playing, setPlaying] = useState<'US' | 'GB' | null>(null)

  const play = (loc: 'US' | 'GB', lang: string) => {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined
    if (!synth || !word) return
    synth.cancel()
    const u = new SpeechSynthesisUtterance(word)
    u.lang = lang
    u.rate = 0.9
    const clear = () => setPlaying((p) => (p === loc ? null : p))
    u.onend = clear
    u.onerror = clear
    setPlaying(loc)
    synth.speak(u)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <VoicePill label="🇺🇸 미국" active={playing === 'US'} onClick={() => play('US', 'en-US')} />
      <VoicePill label="🇬🇧 영국" active={playing === 'GB'} onClick={() => play('GB', 'en-GB')} />
      <button
        type="button"
        aria-label="발음 듣기"
        onClick={(e) => {
          e.stopPropagation()
          play('US', 'en-US')
        }}
        style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-text-brand)', cursor: 'pointer', display: 'inline-flex' }}
      >
        <IconSpeaker size={20} />
      </button>
    </div>
  )
}

function VoicePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
        background: active ? 'var(--color-brand-weak)' : 'var(--color-bg-primary)',
        color: active ? 'var(--color-text-brand)' : 'var(--color-text-secondary)',
        border: active ? '1px solid transparent' : '1px solid var(--color-border-default)',
      }}
    >
      {label}
    </button>
  )
}

function Tag({ label, tone }: { label: string; tone: 'grey' | 'blue' }) {
  const blue = tone === 'blue'
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 500,
        padding: '2px 7px',
        borderRadius: 5,
        background: blue ? 'var(--color-brand-weak)' : 'var(--color-bg-secondary)',
        color: blue ? 'var(--color-text-brand)' : 'var(--color-text-secondary)',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}
