import React from 'react'
import { TagChip } from '../core/TagChip'

/** 단어장 상단 태그 필터 탭 (FR-04) — 수평 스크롤, 시험 태그가 맨 앞 */
export function TagFilterTabs({ items = [], active, onSelect, onManage }) {
  const exams = items.filter((i) => i.kind === 'exam')
  const rest = items.filter((i) => i.kind !== 'exam')
  const ordered = [...exams, ...rest]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', padding: '4px 0', fontFamily: 'var(--font-sans)', scrollbarWidth: 'none' }}>
      {ordered.map((i) => (
        <span key={i.key || i.label} style={{ flexShrink: 0 }}>
          <TagChip
            kind={i.kind === 'exam' ? 'exam' : 'tag'}
            label={i.count != null ? i.label + ' ' + i.count : i.label}
            dday={i.dday}
            active={(i.key || i.label) === active}
            onClick={() => onSelect && onSelect(i.key || i.label)}
          />
        </span>
      ))}
      {onManage && (
        <button
          type="button"
          onClick={onManage}
          style={{ flexShrink: 0, height: 24, padding: '0 10px', background: 'transparent', border: '1px dashed var(--color-border-default)', borderRadius: 'var(--radius-full)', color: 'var(--color-text-tertiary)', fontFamily: 'inherit', fontSize: 11, cursor: 'pointer' }}
        >
          태그 관리
        </button>
      )}
    </div>
  )
}
