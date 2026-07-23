import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Tabs, Chip, Button, SearchBar, BottomSheet } from '@/shared/ui'
import { CardRow } from '@/widgets/card-row'
import type { CardRowView } from '@/widgets/card-row'
import { fetchCards, tagCardExams } from '@/entities/card'
import type { Card, FeedSubject } from '@/entities/card'
import { fetchExams } from '@/entities/exam'

const SUBJECT_TABS: { key: FeedSubject; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'ENGLISH', label: '영어' },
  { key: 'MATH', label: '수학' },
]

type Status = 'ALL' | 'GRADUATED' | 'WAITING' | 'WEAK' | 'UNTAGGED'
const STATUS_CHIPS: { key: Status; label: string }[] = [
  { key: 'ALL', label: '전체 128' },
  { key: 'GRADUATED', label: '졸업완료 13' },
  { key: 'WAITING', label: '복습대기 15' },
  { key: 'WEAK', label: '약점유형' },
  { key: 'UNTAGGED', label: '시험 미지정' },
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
    exams: ['중간'],
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

const EXAMS = [
  { id: 'mid', name: '중간고사', detail: '수학 · D-7' },
  { id: 'final', name: '기말고사', detail: '전과목 · D-38' },
  { id: 'mock', name: '9월 모의고사', detail: '전과목 · D-52' },
]

// 피드 Card → 행 뷰 (오답노트와 동일 매핑)
function toRow(c: Card): CardRowView {
  const isWord = c.type === 'WORD'
  const exams = c.exams ?? []
  return {
    id: c.id,
    title: isWord ? (c.word ?? '') : (c.latex ?? c.summary ?? '문제'),
    subtitle: isWord ? (c.contextMeaning ?? '') : (c.summary ?? ''),
    exams: exams.map((e) => e.title),
    untagged: exams.length === 0,
    showSpeaker: isWord,
  }
}

/** 시험 선택 시트 (14-4, F-29) — 카드에 시험 지정. 마이/오답노트 딤 위 BottomSheet 복수 선택 */
export function ExamSelectPage() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState<FeedSubject>('ALL')
  const [status, setStatus] = useState<Status>('ALL')
  const [open, setOpen] = useState(true)
  const [checked, setChecked] = useState<Set<string>>(new Set(['mid']))
  const [activeCardId, setActiveCardId] = useState<number | null>(null)

  // 실 데이터 — 미가동 시 데모 폴백
  const cardsQ = useQuery({ queryKey: ['cards', subject], queryFn: () => fetchCards(subject), retry: 0 })
  const rows = cardsQ.data && cardsQ.data.length > 0 ? cardsQ.data.map(toRow) : ROWS
  const examsQ = useQuery({ queryKey: ['exams'], queryFn: fetchExams, retry: 0 })
  const examList =
    examsQ.data && examsQ.data.length > 0
      ? examsQ.data.map((e) => ({ id: String(e.id), name: e.title, detail: `${e.subject ?? '전과목'} · D-${e.dday}` }))
      : EXAMS
  const tag = useMutation({
    mutationFn: (v: { cardId: number; examIds: number[] }) => tagCardExams(v.cardId, v.examIds),
    onSuccess: () => setOpen(false),
  })

  const done = () => {
    const examIds = [...checked].map(Number).filter((n) => !Number.isNaN(n))
    if (activeCardId != null && examIds.length) tag.mutate({ cardId: activeCardId, examIds })
    else setOpen(false)
  }

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-secondary)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '12px var(--spacing-xl) 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>오답노트</h1>
          <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>128장</span>
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
        <Button block size="lg" onClick={() => navigate('/flashcard')}>
          학습하기
        </Button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px var(--spacing-xl) 8px' }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>졸업 카드 표시 ✓</span>
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
          <CardRow
            key={row.id}
            row={row}
            onClick={() => {
              setActiveCardId(row.id)
              setOpen(true)
            }}
          />
        ))}
      </div>

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>시험 지정</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
            이 카드가 포함될 시험을 선택하세요 (복수 가능)
          </span>
        </div>

        {examList.map((e) => {
          const on = checked.has(e.id)
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => toggle(e.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: 14,
                borderRadius: 'var(--radius-md)',
                background: on ? 'var(--color-brand-weak)' : 'var(--color-bg-elevated)',
                border: on ? '1.5px solid var(--color-brand-primary)' : '1px solid var(--color-border-default)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  background: on ? 'var(--color-brand-primary)' : 'transparent',
                  color: on ? 'var(--color-text-inverse)' : 'transparent',
                  border: on ? 'none' : '1.5px solid var(--color-border-default)',
                }}
                aria-hidden
              >
                ✓
              </span>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{e.name}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{e.detail}</span>
              </div>
            </button>
          )
        })}

        <Button block size="lg" onClick={done} disabled={tag.isPending}>
          {tag.isPending ? '지정 중…' : '완료'}
        </Button>
      </BottomSheet>
    </div>
  )
}
