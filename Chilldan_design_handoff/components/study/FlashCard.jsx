import React from 'react'
import { Icon } from '../core/Icon'

const FACE = {
  position: 'absolute',
  inset: 0,
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  background: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-border-default)',
  borderRadius: 20,
  boxShadow: 'var(--shadow-flashcard)',
  padding: 18,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  overflow: 'hidden',
  fontFamily: 'var(--font-sans)',
}

/** 공용 플래시카드 — 탭하면 3D 플립. 앞: 단어 + AI 연상 이미지 / 뒤: 뜻(형광펜) + 예문 (FR-05) */
export function FlashCard({ card, height = 500, flipped, onFlip }) {
  const [inner, setInner] = React.useState(false)
  const isFlipped = flipped !== undefined ? flipped : inner
  const toggle = onFlip || (() => setInner((f) => !f))
  return (
    <div onClick={toggle} style={{ perspective: 1200, height, cursor: 'pointer' }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s var(--ease-flip)',
          transform: isFlipped ? 'rotateY(180deg)' : 'none',
        }}
      >
        <div style={FACE}>
          <FaceContent card={card} showMeaning={false} />
        </div>
        <div style={{ ...FACE, border: '1.5px solid var(--color-brand-primary)', transform: 'rotateY(180deg)' }}>
          <FaceContent card={card} showMeaning />
        </div>
      </div>
    </div>
  )
}

function FaceContent({ card, showMeaning }) {
  return (
    <>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 104,
          flexShrink: 0,
          borderRadius: 12,
          background: 'var(--gradient-concept)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {card.imageUrl ? (
          <img src={card.imageUrl} alt="AI 연상 이미지" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 44, lineHeight: 1 }} aria-hidden>{card.emoji || '📘'}</span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)' }}>{card.word}</span>
        {showMeaning && card.meaning && (
          <span style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.5, color: 'var(--color-text-primary)' }}>
            <mark style={{ background: 'var(--gradient-highlighter)', color: 'inherit', padding: '0 3px', borderRadius: 3 }}>{card.meaning}</mark>
          </span>
        )}
        {card.pronunciation && <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>{card.pronunciation}</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <VoicePill label="🇺🇸 미국" />
        <VoicePill label="🇬🇧 영국" />
        <span style={{ color: 'var(--color-text-brand)', display: 'inline-flex' }}><Icon name="speaker" size={20} /></span>
      </div>

      {card.tags && card.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {card.tags.map((t) => (
            <span
              key={t.label}
              style={{
                fontSize: 10,
                fontWeight: t.kind === 'exam' ? 700 : 500,
                padding: t.kind === 'exam' ? '3px 8px' : '2px 7px',
                borderRadius: t.kind === 'exam' ? 999 : 5,
                background: t.kind === 'exam' ? 'var(--color-brand-weak)' : 'var(--color-bg-secondary)',
                color: t.kind === 'exam' ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                whiteSpace: 'nowrap',
              }}
            >
              {t.kind === 'exam' ? '📅 ' + t.label + (t.dday != null ? ' D-' + t.dday : '') : t.label}
            </span>
          ))}
        </div>
      )}

      {card.example ? (
        showMeaning ? (
          <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)' }}>예문</span>
            <p style={{ margin: 0, fontSize: 16, lineHeight: '20px', color: 'var(--color-text-primary)' }}>{card.example}</p>
            {card.exampleTranslation && (
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>{card.exampleTranslation}</p>
            )}
          </div>
        ) : null
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 0' }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>{showMeaning ? '예문은 아직 없어요' : ''}</span>
        </div>
      )}

      <span style={{ marginTop: 'auto', textAlign: 'center', fontSize: 12, color: 'var(--color-text-tertiary)' }}>
        {showMeaning ? '탭하면 단어로 돌아가요' : '카드를 탭하면 뜻이 보여요'}
      </span>
    </>
  )
}

function VoicePill({ label, active = false }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        background: active ? 'var(--color-brand-weak)' : 'var(--color-bg-primary)',
        color: active ? 'var(--color-text-brand)' : 'var(--color-text-secondary)',
        border: active ? '1px solid transparent' : '1px solid var(--color-border-default)',
      }}
    >
      {label}
    </span>
  )
}
