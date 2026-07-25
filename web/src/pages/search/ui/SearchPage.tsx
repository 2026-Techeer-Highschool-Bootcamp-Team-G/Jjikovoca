import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { IconChevronLeft, IconSearch } from '@/shared/ui'
import { CardRow } from '@/widgets/card-row'
import type { CardRowView } from '@/widgets/card-row'
import { fetchCards } from '@/entities/card'
import type { Card } from '@/entities/card'

// 피드 Card → 행 뷰(검색 결과)
function toRow(c: Card): CardRowView {
  const isWord = c.type === 'WORD'
  return {
    id: c.id,
    title: isWord ? (c.word ?? '') : (c.latex ?? c.summary ?? '문제'),
    subtitle: isWord ? (c.contextMeaning ?? '') : (c.summary ?? ''),
    exams: (c.exams ?? []).map((e) => e.title),
    showSpeaker: isWord,
  }
}

/** 통합 검색 (07) — GET /api/cards?q= 서버 부분일치 검색 */
export function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const q = query.trim()
  const { data } = useQuery({
    queryKey: ['cards-search', q],
    queryFn: () => fetchCards('ALL', { q }),
    enabled: q !== '',
  })
  const rows = q === '' ? [] : (data ?? []).map(toRow)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-secondary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 20px 6px 12px' }}>
        <button
          type="button"
          aria-label="뒤로"
          onClick={() => navigate(-1)}
          style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer' }}
        >
          <IconChevronLeft />
        </button>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 44,
            padding: '0 14px',
            background: 'var(--color-bg-elevated)',
            borderRadius: 12,
            color: 'var(--color-text-tertiary)',
          }}
        >
          <IconSearch size={20} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder="단어 · 문제 · 개념 검색"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px var(--spacing-xl)' }}>
        {rows.map((row) => (
          <CardRow key={row.id} row={row} onClick={() => navigate('/flashcard')} />
        ))}
        {q === '' && (
          <p style={{ margin: '32px 0', textAlign: 'center', fontSize: 13, color: 'var(--color-text-tertiary)' }}>
            단어·문제·개념을 검색해보세요
          </p>
        )}
        {q !== '' && rows.length === 0 && (
          <p style={{ margin: '32px 0', textAlign: 'center', fontSize: 13, color: 'var(--color-text-tertiary)' }}>
            "{query.trim()}" 검색 결과가 없어요
          </p>
        )}
      </div>
    </div>
  )
}
