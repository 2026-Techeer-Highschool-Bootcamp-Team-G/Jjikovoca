import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Tabs, Chip, Button, SearchBar, BottomSheet } from '@/shared/ui'
import { CardRow } from '@/widgets/card-row'
import type { CardRowView } from '@/widgets/card-row'
import { fetchCards, tagCardExams, untagCardExam } from '@/entities/card'
import type { Card, FeedSubject } from '@/entities/card'
import { fetchExams } from '@/entities/exam'

const SUBJECT_TABS: { key: FeedSubject; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'ENGLISH', label: '영어' },
  { key: 'MATH', label: '수학' },
]

type Status = 'ALL' | 'GRADUATED' | 'WAITING' | 'WEAK' | 'UNTAGGED'
const STATUS_CHIPS: { key: Status; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'GRADUATED', label: '졸업완료' },
  { key: 'WAITING', label: '복습대기' },
  { key: 'WEAK', label: '약점유형' },
  { key: 'UNTAGGED', label: '시험 미지정' },
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

/** 시험 선택 시트 (14-4, F-29) — 카드에 시험 지정/해제. 실 카드·시험 기반 */
export function ExamSelectPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [subject, setSubject] = useState<FeedSubject>('ALL')
  const [status, setStatus] = useState<Status>('ALL')
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [activeCardId, setActiveCardId] = useState<number | null>(null)
  const originalRef = useRef<Set<number>>(new Set()) // 시트 열 때 카드의 기존 시험(차분 계산용)

  const cardsQ = useQuery({ queryKey: ['cards', subject], queryFn: () => fetchCards(subject) })
  const cards = cardsQ.data ?? []
  const examsQ = useQuery({ queryKey: ['exams'], queryFn: fetchExams })
  const examList = (examsQ.data ?? []).map((e) => ({ id: e.id, name: e.title, detail: `${e.subject ?? '전과목'} · D-${e.dday}` }))

  // 완료 — 추가(tagCardExams)·해제(untagCardExam) 차분을 반영
  const save = useMutation({
    mutationFn: async () => {
      if (activeCardId == null) return
      const orig = originalRef.current
      const added = [...checked].filter((id) => !orig.has(id))
      const removed = [...orig].filter((id) => !checked.has(id))
      if (added.length) await tagCardExams(activeCardId, added)
      for (const id of removed) await untagCardExam(activeCardId, id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cards'] })
      setOpen(false)
    },
  })

  const openSheet = (card: Card) => {
    const ids = new Set((card.exams ?? []).map((e) => e.id))
    originalRef.current = ids
    setChecked(new Set(ids))
    setActiveCardId(card.id)
    setOpen(true)
  }

  const toggle = (id: number) =>
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
          <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>{cards.length}장</span>
        </div>
        <button type="button" style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 500, color: 'var(--color-text-brand)', cursor: 'pointer' }}>
          PDF ↗
        </button>
      </div>

      <div style={{ padding: '12px var(--spacing-xl) 0' }}>
        <SearchBar placeholder="단어 · 문제 · 개념 검색" onClick={() => navigate('/search')} />
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
        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>카드를 탭해 시험을 지정/해제하세요</span>
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
        {cards.map((c) => (
          <CardRow key={c.id} row={toRow(c)} onClick={() => openSheet(c)} />
        ))}
        {cards.length === 0 && (
          <p style={{ margin: '32px 0', textAlign: 'center', fontSize: 13, color: 'var(--color-text-tertiary)' }}>
            {cardsQ.isLoading ? '불러오는 중…' : '카드가 없어요 — 시험지를 촬영해보세요'}
          </p>
        )}
      </div>

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>시험 지정</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
            이 카드가 포함될 시험을 선택하세요 (복수 가능 · 해제하려면 다시 탭)
          </span>
        </div>

        {examList.length === 0 && (
          <p style={{ margin: '16px 0', textAlign: 'center', fontSize: 13, color: 'var(--color-text-tertiary)' }}>
            등록된 시험이 없어요 — 시험 일정에서 먼저 등록해주세요
          </p>
        )}

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

        <Button block size="lg" onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? '반영 중…' : '완료'}
        </Button>
      </BottomSheet>
    </div>
  )
}
