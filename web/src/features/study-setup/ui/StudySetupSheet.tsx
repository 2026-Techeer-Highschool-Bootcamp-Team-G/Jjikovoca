import { useState } from 'react'
import { Button } from '@/shared/ui'
import type { ReviewType, StudyMethod } from '../model/types'

interface Props {
  onStart: (method: StudyMethod, type: ReviewType) => void
}

const label = { fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)' } as const

// 학습 설정 시트 내용 (149:851…) — 학습 방식 2택 + 복습 유형 + 학습 시작
export function StudySetupSheet({ onStart }: Props) {
  const [method, setMethod] = useState<StudyMethod>('TODAY')
  const [type, setType] = useState<ReviewType>('FLASHCARD')

  return (
    <>
      <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>
        학습 설정
      </span>

      <span style={label}>무엇을 학습할까요?</span>
      <div style={{ display: 'flex', gap: 8 }}>
        <MethodCard
          active={method === 'TODAY'}
          emoji="🔥"
          title="오늘 복습"
          sub="시험범위 기억률 62% · 24개"
          recommend
          onClick={() => setMethod('TODAY')}
        />
        <MethodCard
          active={method === 'PICK'}
          emoji="✓"
          title="직접 선택"
          sub="내가 골라서"
          onClick={() => setMethod('PICK')}
        />
      </div>

      <span style={label}>복습 유형</span>
      <div style={{ display: 'flex', gap: 8 }}>
        <TypeChip active={type === 'FLASHCARD'} label="플래시카드" onClick={() => setType('FLASHCARD')} />
        <TypeChip active={type === 'CLOZE'} label="빈칸 퀴즈" onClick={() => setType('CLOZE')} />
      </div>

      <Button block size="lg" onClick={() => onStart(method, type)}>
        학습 시작
      </Button>
    </>
  )
}

function MethodCard({
  active,
  emoji,
  title,
  sub,
  recommend = false,
  onClick,
}: {
  active: boolean
  emoji: string
  title: string
  sub: string
  recommend?: boolean
  onClick: () => void
}) {
  // '오늘 복습' 추천 카드가 선택되면 주변 빨간 글로우 + 미세 흔들림 (오답노트 QA)
  const hot = active && recommend
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'relative',
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 3,
        padding: 14,
        borderRadius: 12,
        textAlign: 'left',
        background: hot ? '#fff1f1' : active ? 'var(--color-brand-weak)' : 'var(--color-bg-elevated)',
        border: hot
          ? '1.5px solid #e5484d'
          : active
            ? '1.5px solid var(--color-brand-primary)'
            : '1px solid var(--color-border-default)',
        cursor: 'pointer',
        animation: hot
          ? 'jjik-red-glow 1.6s ease-in-out infinite, jjik-shake 2.6s ease-in-out infinite'
          : undefined,
      }}
    >
      {recommend && (
        <span
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: '#e5484d',
            color: 'var(--common-white, #fff)',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.02em',
            padding: '2px 7px',
            borderRadius: 999,
            lineHeight: 1.4,
          }}
        >
          추천
        </span>
      )}
      <span style={{ fontSize: 18 }} aria-hidden>
        {emoji}
      </span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: hot ? '#e5484d' : active ? 'var(--color-brand-primary)' : 'var(--color-text-primary)',
        }}
      >
        {title}
      </span>
      <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>{sub}</span>
    </button>
  )
}

function TypeChip({
  active,
  label: text,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: 'var(--radius-full)',
        fontSize: 13,
        fontWeight: 500,
        background: active ? 'var(--color-brand-primary)' : 'transparent',
        color: active ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
        border: active ? '1px solid transparent' : '1px solid var(--color-border-default)',
        cursor: 'pointer',
      }}
    >
      {text}
    </button>
  )
}
