import type { CSSProperties } from 'react'
import { IconSpeaker } from '@/shared/ui'
import type { FlashcardData } from '../model/types'

interface Props {
  data: FlashcardData
  flipped: boolean
  onFlip: () => void
}

const CONCEPT_GRADIENT = 'linear-gradient(90deg, var(--color-brand-weak), var(--teal-50))'
const FACE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'var(--color-bg-elevated)',
  borderRadius: 20,
  boxShadow: 'var(--shadow-modal)',
  overflow: 'hidden',
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
}

// 플래시카드 (24:137 / 28:230) — 탭하면 앞↔뒤 3D 플립. 앞: 단어, 뒤: 뜻·예문
export function FlashcardView({ data, flipped, onFlip }: Props) {
  return (
    <div onClick={onFlip} style={{ perspective: 1200, height: 400, cursor: 'pointer' }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <div style={{ ...FACE, border: '1px solid var(--color-border-default)' }}>
          <FrontFace data={data} />
        </div>
        <div
          style={{
            ...FACE,
            border: '1.5px solid var(--color-brand-primary)',
            transform: 'rotateY(180deg)',
          }}
        >
          <BackFace data={data} />
        </div>
      </div>
    </div>
  )
}

function ConceptImage({ emoji, height }: { emoji: string; height: number }) {
  return (
    <div
      style={{
        position: 'relative',
        height,
        borderRadius: 12,
        background: CONCEPT_GRADIENT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 48,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          fontSize: 10,
          fontWeight: 500,
          padding: '3px 8px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(255,255,255,0.85)',
          color: 'var(--color-text-secondary)',
        }}
      >
        ✨ AI 연상 이미지
      </span>
      <span aria-hidden>{emoji}</span>
    </div>
  )
}

function VoicePills() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          padding: '5px 10px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-brand-weak)',
          color: 'var(--color-text-brand)',
        }}
      >
        🇺🇸 미국
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          padding: '5px 10px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border-default)',
          color: 'var(--color-text-secondary)',
        }}
      >
        🇬🇧 영국
      </span>
    </div>
  )
}

function Tag({ label, tone }: { label: string; tone: 'grey' | 'blue' | 'red' }) {
  const map = {
    grey: { bg: 'var(--color-bg-secondary)', fg: 'var(--color-text-secondary)' },
    blue: { bg: 'var(--color-brand-weak)', fg: 'var(--color-text-brand)' },
    red: { bg: 'var(--color-danger-weak)', fg: '#c22c3a' },
  }[tone]
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 500,
        padding: '2px 7px',
        borderRadius: 5,
        background: map.bg,
        color: map.fg,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

function FrontFace({ data }: { data: FlashcardData }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 15 }}>
      <ConceptImage emoji={data.conceptEmoji} height={118} />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 30, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {data.word}
        </span>
        <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>
          {data.pronunciation}
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <VoicePills />
          <span style={{ color: 'var(--color-text-brand)', display: 'inline-flex' }}>
            <IconSpeaker size={20} />
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {data.frontTags.map((t) => (
            <Tag key={t.label} label={t.label} tone={t.tone} />
          ))}
        </div>
      </div>
      <span
        style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-tertiary)' }}
      >
        카드를 탭하면 뜻이 보여요
      </span>
    </div>
  )
}

function BackFace({ data }: { data: FlashcardData }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 15, gap: 8 }}>
      <ConceptImage emoji={data.conceptEmoji} height={104} />
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {data.word}
          </span>
          <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>
            {data.pronunciation}
          </span>
        </div>
        <VoicePills />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Tag label={data.pos} tone="grey" />
        {data.backTags.map((t) => (
          <Tag key={t.label} label={t.label} tone={t.tone} />
        ))}
      </div>
      <span style={{ fontSize: 19, fontWeight: 700, color: 'var(--color-text-brand)' }}>
        {data.meaning}
      </span>
      <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{data.dictNote}</span>
      <div
        style={{
          background: 'var(--color-bg-secondary)',
          borderRadius: 10,
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)' }}>
            예문
          </span>
          <span style={{ color: 'var(--color-text-brand)', display: 'inline-flex' }}>
            <IconSpeaker size={18} />
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-primary)' }}>
          {data.example.pre}
          <mark
            style={{
              background: 'var(--color-highlight)',
              borderRadius: 4,
              padding: '0 2px',
              color: 'inherit',
            }}
          >
            {data.example.highlight}
          </mark>
          {data.example.post}
        </p>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>
          {data.example.translation}
        </p>
      </div>
    </div>
  )
}
