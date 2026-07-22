import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconChevronLeft, IconSearch } from '@/shared/ui'
import { CardRow } from '@/widgets/card-row'
import type { CardRowView } from '@/widgets/card-row'

// 백엔드 연결 전 데모 (프로토타입 07 통합 검색) — 'plant' 결과
const RESULTS: CardRowView[] = [
  {
    id: 1,
    title: 'plant',
    pronunciation: '[plænt]',
    subtitle: '공장, 설비',
    tags: [
      { label: '명사', tone: 'grey' },
      { label: '산업', tone: 'blue' },
    ],
    typeBadge: { label: '다의어', color: 'red' },
    showSpeaker: true,
  },
]

/** 통합 검색 (07) */
export function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('plant')

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
        {RESULTS.map((row) => (
          <CardRow key={row.id} row={row} onClick={() => navigate('/flashcard')} />
        ))}
      </div>
    </div>
  )
}
