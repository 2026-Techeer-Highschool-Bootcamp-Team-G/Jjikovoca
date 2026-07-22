import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, Chip, Button, SearchBar } from '@/shared/ui'
import { CardRow } from '@/widgets/card-row'
import type { CardRowView } from '@/widgets/card-row'
import type { FeedSubject } from '@/entities/card'

const SUBJECT_TABS: { key: FeedSubject; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'ENGLISH', label: '영어' },
  { key: 'MATH', label: '수학' },
]

type Status = 'ALL' | 'GRADUATED' | 'WAITING' | 'WEAK'
const STATUS_CHIPS: { key: Status; label: string }[] = [
  { key: 'ALL', label: '전체 128' },
  { key: 'GRADUATED', label: '졸업완료 13' },
  { key: 'WAITING', label: '복습대기 15' },
  { key: 'WEAK', label: '약점유형' },
]

const ROWS: CardRowView[] = [
  {
    id: 1,
    title: 'sound',
    pronunciation: '[saʊnd]',
    subtitle: '타당한, 믿을 만한 · n. 소리',
    tags: [{ label: '형용사', tone: 'grey' }, { label: '학업', tone: 'blue' }],
    typeBadge: { label: '다의어', color: 'red' },
    exams: ['중간고사'],
    showSpeaker: true,
  },
  {
    id: 2,
    title: 'take charge of',
    subtitle: '~을 책임지다, 맡다',
    tags: [{ label: '동사구', tone: 'grey' }, { label: '회사', tone: 'blue' }],
    typeBadge: { label: '숙어', color: 'blue' },
    exams: ['중간고사'],
    showSpeaker: true,
  },
  {
    id: 3,
    title: 'x² − 5x + 6 = 0 의 두 근',
    subtitle: '이차방정식 · 인수분해 · 사고 단계 4개',
    tags: [{ label: '수학', tone: 'grey' }, { label: '문제', tone: 'blue' }],
    untagged: true,
  },
]

/** 직접 선택 모드 — 더보기 확장 (09-3, F-28). 09-2와 동일하되 하단에 "더보기 124개" 버튼 추가 */
export function StudyPickThreePage() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState<FeedSubject>('ALL')
  const [status, setStatus] = useState<Status>('ALL')
  const [picked, setPicked] = useState<Set<number>>(new Set([1, 2]))

  const toggle = (id: number) =>
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const count = picked.size

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

      <div style={{ padding: '0 var(--spacing-xl)', marginTop: 16 }}>
        <Button block size="lg" disabled={count === 0} style={{ opacity: count === 0 ? 0.4 : 1 }} onClick={() => navigate('/flashcard')}>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 var(--spacing-xl) 12px' }}>
        {ROWS.map((row) => (
          <CardRow key={row.id} row={row} selectable selected={picked.has(row.id)} onClick={() => toggle(row.id)} />
        ))}
      </div>

      <div style={{ padding: '0 var(--spacing-xl) 24px' }}>
        <button
          type="button"
          style={{
            width: '100%',
            height: 44,
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
          }}
        >
          더보기 124개 ▾
        </button>
      </div>
    </div>
  )
}
