import { useState } from 'react'
import { Button, IconCheck, IconChevronRight } from '@/shared/ui'
import type { ReviewType, StudyMethod } from '../model/types'

interface Props {
  onStart: (method: StudyMethod, type: ReviewType) => void
}

// AI가 사용자 내역·리포트를 학습해 만든 추천 (백엔드 연결 전 데모 값)
const AI_RECOMMEND = {
  reason: '17회 중간고사가 3일 남았어요. 최근 헷갈려한 다의어 위주로 24개를 골랐어요.',
  stats: [
    { icon: '🎯', text: '기억률 62%' },
    { icon: '🃏', text: '24개' },
    { icon: '⏱', text: '약 8분' },
  ],
}

const label = { fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)' } as const

// 학습 설정 시트 (149:851…) — AI 추천 카드로 강조 강화(추천 이유·통계) + 직접 선택 + 학습 시작 (오답노트 QA)
export function StudySetupSheet({ onStart }: Props) {
  const [method, setMethod] = useState<StudyMethod>('TODAY')
  const [type, setType] = useState<ReviewType>('FLASHCARD')
  const aiPicked = method === 'TODAY'

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          학습 설정
        </span>
        <span style={label}>무엇을 학습할까요?</span>
      </div>

      {/* AI 추천 카드 — 기본 선택. 추천 이유 + 통계로 강조 (오답노트 QA) */}
      <button
        type="button"
        onClick={() => setMethod('TODAY')}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 10,
          padding: '16px 16px 14px',
          borderRadius: 16,
          textAlign: 'left',
          background: aiPicked ? 'var(--color-brand-weak)' : 'var(--color-bg-elevated)',
          border: aiPicked
            ? '1.5px solid var(--color-brand-primary)'
            : '1px solid var(--color-border-default)',
          boxShadow: aiPicked ? '0 4px 16px rgba(49, 130, 246, 0.18)' : 'none',
          cursor: 'pointer',
          transition: 'background 160ms ease, border-color 160ms ease, box-shadow 160ms ease',
        }}
      >
        {aiPicked && (
          <span
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'var(--color-brand-primary)',
              color: 'var(--color-text-inverse)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-hidden
          >
            <IconCheck size={15} />
          </span>
        )}

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: 'var(--color-brand-primary)',
            color: 'var(--color-text-inverse)',
            fontSize: 11,
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 999,
          }}
        >
          ✨ AI 추천
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: aiPicked ? 'var(--color-brand-primary)' : 'var(--color-text-primary)',
            }}
          >
            오늘은 이렇게 복습해보세요
          </span>
          <span style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
            {AI_RECOMMEND.reason}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {AI_RECOMMEND.stats.map((s) => (
            <span
              key={s.text}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                fontWeight: 600,
                color: aiPicked ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
              }}
            >
              <span aria-hidden>{s.icon}</span>
              {s.text}
            </span>
          ))}
        </div>
      </button>

      {/* 직접 선택할게요 — 선택 시 복습 유형 노출 */}
      <button
        type="button"
        onClick={() => setMethod('PICK')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '14px 16px',
          borderRadius: 14,
          textAlign: 'left',
          background: !aiPicked ? 'var(--color-brand-weak)' : 'var(--color-bg-elevated)',
          border: !aiPicked
            ? '1.5px solid var(--color-brand-primary)'
            : '1px solid var(--color-border-default)',
          cursor: 'pointer',
          transition: 'background 160ms ease, border-color 160ms ease',
        }}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: !aiPicked ? 'var(--color-brand-primary)' : 'var(--color-text-primary)',
          }}
        >
          직접 선택할게요
        </span>
        <IconChevronRight size={18} />
      </button>

      {/* 복습 유형 — 직접 선택 시에만. AI 추천은 학습법까지 AI가 정함 */}
      {!aiPicked && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={label}>복습 유형</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <TypeChip active={type === 'FLASHCARD'} label="플래시카드" onClick={() => setType('FLASHCARD')} />
            <TypeChip active={type === 'CLOZE'} label="빈칸 퀴즈" onClick={() => setType('CLOZE')} />
          </div>
        </div>
      )}

      <Button block size="lg" onClick={() => onStart(method, type)}>
        학습 시작
      </Button>
    </>
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
