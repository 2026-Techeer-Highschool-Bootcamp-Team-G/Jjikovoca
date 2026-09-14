import React from 'react'
import { TagChip } from './TagChip'

/** 카드 태그 줄 — 시험 태그 우선 + 일반 태그 max 개까지 + 나머지는 '+N' 말줄임 (FR-04) */
export function TagList({ tags = [], max = 2, size = 'md', align = 'flex-start', onMore }) {
  const exams = tags.filter((t) => t.kind === 'exam')
  const rest = tags.filter((t) => t.kind !== 'exam')
  const shown = rest.slice(0, max)
  const hidden = rest.length - shown.length
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: align, minWidth: 0 }}>
      {exams.map((t) => <TagChip key={t.label} kind="exam" label={t.label} dday={t.dday} size={size} />)}
      {shown.map((t) => <TagChip key={t.label} label={t.label} size={size} />)}
      {hidden > 0 && <TagChip kind="more" label={'+' + hidden} size={size} onClick={onMore} />}
    </div>
  )
}
