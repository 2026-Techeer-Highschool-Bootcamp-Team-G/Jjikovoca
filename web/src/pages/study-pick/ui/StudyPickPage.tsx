import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Tabs, Chip, Button, SearchBar } from '@/shared/ui'
import { CardRow } from '@/widgets/card-row'
import type { CardRowView } from '@/widgets/card-row'
import { fetchCards } from '@/entities/card'
import type { Card, FeedSubject } from '@/entities/card'

const SUBJECT_TABS: { key: FeedSubject; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'ENGLISH', label: '영어' },
  { key: 'MATH', label: '수학' },
]

type Status = 'ALL' | 'GRADUATED' | 'WAITING' | 'WEAK'
const STATUS_CHIPS: { key: Status; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'GRADUATED', label: '졸업완료' },
  { key: 'WAITING', label: '복습대기' },
  { key: 'WEAK', label: '약점유형' },
]

// 피드 Card → 행 뷰(제목·뜻/요약·시험). pronunciation·품사는 피드 미제공
function toRow(c: Card): CardRowView {
  const isWord = c.type === 'WORD'
  const exams = c.exams ?? []
  return {
    id: c.id,
    title: isWord ? (c.word ?? '') : (c.latex ?? c.summary ?? '문제'),
    subtitle: isWord ? (c.contextMeaning ?? '') : (c.summary ?? ''),
    exams: exams.map((e) => e.title),
    showSpeaker: isWord,
  }
}

/** 직접 선택 모드 (09-2, F-28) — 카드를 체크로 골라 학습 세트 구성 */
export function StudyPickPage() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState<FeedSubject>('ALL')
  const [status, setStatus] = useState<Status>('ALL')
  const [picked, setPicked] = useState<Set<number>>(new Set())

  // 실 카드 목록 — 여기서 고른 cardIds 로 PICK 학습 큐를 만든다
  const { data, isLoading } = useQuery({ queryKey: ['cards', subject], queryFn: () => fetchCards(subject) })
  const rows = (data ?? []).map(toRow)

  const toggle = (id: number) =>
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const count = picked.size
  const start = () => navigate('/flashcard', { state: { cardIds: [...picked] } })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-secondary)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '12px var(--spacing-xl) 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>오답노트</h1>
          <span style={{ fontSize: 13, color: 'var(--color-text-brand)' }}>{count}개 선택됨</span>
        </div>
        <button type="button" style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 500, color: 'var(--color-text-brand)', cursor: 'pointer' }}>
          PDF ↗
        </button>
      </div>

      <div style={{ padding: '12px var(--spacing-xl) 0' }}>
        <SearchBar placeholder="단어 · 문제 · 개념 검색" />
      </div>

      <div style={{ marginTop: 12, background: 'var(--color-bg-primary)' }}>
        <Tabs tabs={SUBJECT_TABS} value={subject} onChange={setSubject} />
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '0 var(--spacing-xl)', marginTop: 16 }}>
        <Button
          variant="weak"
          size="lg"
          block
          disabled={count === 0}
          style={{ opacity: count === 0 ? 0.4 : 1 }}
          onClick={() => navigate('/exam-select')}
        >
          시험 지정
        </Button>
        <Button block size="lg" disabled={count === 0} style={{ opacity: count === 0 ? 0.4 : 1 }} onClick={start}>
          선택({count}) 학습 시작
        </Button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px var(--spacing-xl) 8px' }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>탭해서 선택 · 필터를 바꿔도 선택은 유지돼요</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-brand)' }}>몰라요 빈도순 ▾</span>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 var(--spacing-xl) 12px' }}>
        {STATUS_CHIPS.map((c) => (
          <div key={c.key} style={{ flexShrink: 0 }}>
            <Chip active={status === c.key} onClick={() => setStatus(c.key)}>
              {c.label}
            </Chip>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 var(--spacing-xl) 24px' }}>
        {rows.map((row) => (
          <CardRow key={row.id} row={row} selectable selected={picked.has(row.id)} onClick={() => toggle(row.id)} />
        ))}
        {rows.length === 0 && (
          <p style={{ margin: '32px 0', textAlign: 'center', fontSize: 13, color: 'var(--color-text-tertiary)' }}>
            {isLoading ? '불러오는 중…' : '선택할 카드가 없어요 — 시험지를 촬영해보세요'}
          </p>
        )}
      </div>
    </div>
  )
}
