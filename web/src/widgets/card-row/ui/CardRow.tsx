import { useState } from 'react'
import { Badge, IconSpeaker } from '@/shared/ui'
import type { BadgeColor } from '@/shared/ui'

export interface CardRowView {
  id: number
  title: string
  pronunciation?: string
  subtitle: string
  tags?: { label: string; tone: 'grey' | 'blue' }[]
  typeBadge?: { label: string; color: Extract<BadgeColor, 'red' | 'blue'> }
  exams?: string[]
  untagged?: boolean
  showSpeaker?: boolean
  example?: string // 예문(영어) — 있을 때만 카드 클릭 시 뒷면처럼 펼침
  exampleTranslation?: string // 예문 한글 해석 — example과 함께 표시
}

// 오답노트 카드 행 (43:330 등) — 단어/문제 공용. 품사·주제 태그 + 유형 배지 + 시험 칩(F-29)
export function CardRow({
  row,
  onClick,
  onSpeak,
  onExamTag,
  selectable = false,
  selected = false,
  speaking = false,
  expandable = false,
}: {
  row: CardRowView
  onClick?: () => void
  onSpeak?: () => void
  onExamTag?: () => void
  selectable?: boolean
  selected?: boolean
  speaking?: boolean // 스피커로 발음 재생 중 — 듣기 끝날 때까지 이 행/단어 강조 (오답노트 QA)
  expandable?: boolean // 단어장: 클릭 시 뜻 아래로 예문·해석을 펼침(예문 데이터가 있는 카드만)
}) {
  // 탭 눌림(햅틱) 시각 효과 — 상세 이동이 없는 카드도 눌린 느낌을 준다
  const [pressed, setPressed] = useState(false)
  // 단어장 카드 뒷면 — 예문·해석 펼침 토글. 예문 데이터가 있을 때만 펼쳐진다
  const [expanded, setExpanded] = useState(false)
  const canExpand = expandable && Boolean(row.example)
  // 클릭 핸들러: 펼칠 수 있으면 토글도 함께, 부모 onClick(햅틱 등)은 항상 호출
  const handleClick =
    canExpand || onClick
      ? () => {
          if (canExpand) setExpanded((v) => !v)
          onClick?.()
        }
      : undefined
  return (
    <article
      onClick={handleClick}
      onPointerDown={handleClick ? () => setPressed(true) : undefined}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        position: 'relative',
        background: speaking ? 'var(--color-brand-weak)' : 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-md)',
        border:
          speaking || selected
            ? '1.5px solid var(--color-brand-primary)'
            : '1.5px solid transparent',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        cursor: handleClick ? 'pointer' : 'default',
        transform: pressed ? 'scale(0.98)' : undefined,
        animation: speaking ? 'jjik-speak-pulse 1.2s ease-in-out infinite' : undefined,
        transition: 'background 160ms ease, border-color 160ms ease, transform 120ms ease',
      }}
    >
      {selectable && (
        <span
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 22,
            height: 22,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            background: selected ? 'var(--color-brand-primary)' : 'var(--color-bg-primary)',
            color: selected ? 'var(--color-text-inverse)' : 'transparent',
            border: selected ? 'none' : '1.5px solid var(--grey-300)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          }}
          aria-hidden
        >
          ✓
        </span>
      )}
      {/* 단어 → 발음기호 → 스피커(발음기호 바로 오른쪽) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            // 재생 중 지금 듣는 단어에 형광펜 하이라이트
            padding: speaking ? '0 3px' : undefined,
            borderRadius: speaking ? 4 : undefined,
            background: speaking
              ? 'linear-gradient(transparent 58%, var(--color-accent) 58%)'
              : undefined,
            transition: 'background 160ms ease',
          }}
        >
          {row.title}
        </span>
        {row.pronunciation && (
          <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>
            {row.pronunciation}
          </span>
        )}
        {row.showSpeaker && (
          <button
            type="button"
            aria-label="발음 듣기"
            onClick={(e) => {
              e.stopPropagation()
              onSpeak?.()
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--color-text-brand)',
              cursor: 'pointer',
              display: 'inline-flex',
              flexShrink: 0,
              animation: speaking ? 'jjik-speak-bob 0.6s ease-in-out infinite' : undefined,
            }}
          >
            <IconSpeaker size={18} />
          </button>
        )}
      </div>

      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{row.subtitle}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        {row.tags?.map((t) => (
          <Tag key={t.label} label={t.label} tone={t.tone} />
        ))}
        {row.typeBadge && (
          <Badge color={row.typeBadge.color} variant="weak" size="sm">
            {row.typeBadge.label}
          </Badge>
        )}
        {row.exams?.map((title) => (
          <ExamChip key={title} title={title} />
        ))}
        {row.untagged && <ExamChip untagged onTag={onExamTag} />}
      </div>

      {/* 단어장 카드 뒷면 — 예문(영어)과 해석(한글). 예문 있는 카드만, 클릭 시 펼침/접힘 */}
      {canExpand &&
        (expanded ? (
          <div
            style={{
              marginTop: 2,
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-brand)' }}>예문</span>
            <span style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--color-text-primary)' }}>{row.example}</span>
            {row.exampleTranslation && (
              <span style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
                {row.exampleTranslation}
              </span>
            )}
          </div>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>탭하면 예문 보기 ›</span>
        ))}
    </article>
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

// 시험 칩 (142:805) — 태깅됨: brand-weak "📅 {시험}" / 미지정: 흐린 테두리 "+ 시험"(탭 시 시험 지정 시트)
function ExamChip({ title, untagged, onTag }: { title?: string; untagged?: boolean; onTag?: () => void }) {
  if (untagged) {
    const style = {
      fontSize: 10,
      fontWeight: 500,
      padding: '3px 8px',
      borderRadius: 'var(--radius-full)',
      border: '1px solid var(--color-border-default)',
      color: 'var(--grey-500)',
      whiteSpace: 'nowrap' as const,
      background: 'transparent',
      cursor: onTag ? 'pointer' : 'default',
    }
    if (onTag) {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onTag()
          }}
          style={style}
        >
          + 시험
        </button>
      )
    }
    return <span style={style}>+ 시험</span>
  }
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 500,
        padding: '3px 8px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-brand-weak)',
        color: 'var(--color-brand-primary)',
        whiteSpace: 'nowrap',
      }}
    >
      📅 {title}
    </span>
  )
}
