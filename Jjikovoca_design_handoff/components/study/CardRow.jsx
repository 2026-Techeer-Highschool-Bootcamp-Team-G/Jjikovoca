import React from 'react'
import { Icon } from '../core/Icon'
import { Badge } from '../core/Badge'
import { TagList } from '../core/TagList'
import { RatingCounts } from './RatingCounts'

// 단어장·검색 카드 행 — 다중 태그(시험 태그 우선 + 일반 태그 +N) + 알/헷/몰 누적 횟수 (FR-04·FR-18)
export function CardRow({ row, onClick, onSpeak, onExamTag, onMoreTags, selectable = false, selected = false, speaking = false, expandable = false }) {
  const [pressed, setPressed] = React.useState(false)
  const [expanded, setExpanded] = React.useState(false)
  const canExpand = expandable && Boolean(row.example)
  const tagItems = [
    ...(row.exams || []).map((e) => (typeof e === 'string' ? { label: e, kind: 'exam' } : { label: e.label, kind: 'exam', dday: e.dday })),
    ...(row.tags || []).map((t) => ({ label: t.label, kind: t.kind === 'exam' ? 'exam' : 'tag', dday: t.dday })),
  ]
  const handleClick =
    canExpand || onClick
      ? () => {
          if (canExpand) setExpanded((v) => !v)
          if (onClick) onClick()
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
        border: speaking || selected ? '1.5px solid var(--color-brand-primary)' : '1.5px solid transparent',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        fontFamily: 'var(--font-sans)',
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
            boxShadow: 'var(--shadow-select-dot)',
          }}
          aria-hidden
        >
          ✓
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            padding: speaking ? '0 3px' : undefined,
            borderRadius: speaking ? 4 : undefined,
            background: speaking ? 'linear-gradient(transparent 58%, var(--color-accent) 58%)' : undefined,
            transition: 'background 160ms ease',
          }}
        >
          {row.title}
        </span>
        {row.pronunciation && (
          <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>{row.pronunciation}</span>
        )}
        {row.showSpeaker && (
          <button
            type="button"
            aria-label="발음 듣기"
            onClick={(e) => {
              e.stopPropagation()
              if (onSpeak) onSpeak()
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
            <Icon name="speaker" size={18} />
          </button>
        )}
      </div>

      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{row.subtitle}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <TagList tags={tagItems} max={row.tagMax != null ? row.tagMax : 2} size="sm" onMore={onMoreTags} />
        {row.typeBadge && (
          <Badge color={row.typeBadge.color} variant="weak" size="sm">
            {row.typeBadge.label}
          </Badge>
        )}
        {row.untagged && <ExamChip untagged onTag={onExamTag} />}
        {row.ratings && (
          <span style={{ marginLeft: 'auto' }}>
            <RatingCounts size="sm" know={row.ratings.know} confused={row.ratings.confused} dontKnow={row.ratings.dontKnow} />
          </span>
        )}
      </div>

      {canExpand &&
        (expanded ? (
          <div style={{ marginTop: 2, padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-brand)' }}>예문</span>
            <span style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--color-text-primary)' }}>{row.example}</span>
            {row.exampleTranslation && (
              <span style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>{row.exampleTranslation}</span>
            )}
          </div>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>탭하면 예문 보기 ›</span>
        ))}
    </article>
  )
}

// 시험 칩 — 태깅됨: brand-weak "📅 {시험}" / 미지정: 흐린 테두리 "+ 시험"
function ExamChip({ untagged, onTag }) {
  if (untagged) {
    const style = {
      fontSize: 10,
      fontWeight: 500,
      padding: '3px 8px',
      borderRadius: 'var(--radius-full)',
      border: '1px solid var(--color-border-default)',
      color: 'var(--grey-500)',
      whiteSpace: 'nowrap',
      background: 'transparent',
      cursor: onTag ? 'pointer' : 'default',
    }
    return onTag ? (
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
    ) : (
      <span style={style}>+ 시험</span>
    )
  }
  return null
}
