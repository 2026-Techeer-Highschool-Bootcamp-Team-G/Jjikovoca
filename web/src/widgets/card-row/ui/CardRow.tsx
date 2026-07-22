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
}

// 오답노트 카드 행 (43:330 등) — 단어/문제 공용. 품사·주제 태그 + 유형 배지 + 시험 칩(F-29)
export function CardRow({
  row,
  onClick,
  onSpeak,
  onExamTag,
  selectable = false,
  selected = false,
}: {
  row: CardRowView
  onClick?: () => void
  onSpeak?: () => void
  onExamTag?: () => void
  selectable?: boolean
  selected?: boolean
}) {
  return (
    <article
      onClick={onClick}
      style={{
        position: 'relative',
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-md)',
        border: selected ? '1.5px solid var(--color-brand-primary)' : '1.5px solid transparent',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        cursor: onClick ? 'pointer' : 'default',
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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {row.title}
          </span>
          {row.pronunciation && (
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>
              {row.pronunciation}
            </span>
          )}
        </div>
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
