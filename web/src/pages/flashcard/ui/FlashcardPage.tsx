import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { NavigationBar } from '@/shared/ui'
import { FlashcardView } from '@/features/flashcard'
import type { FlashcardData } from '@/features/flashcard'
import { GradeButtons } from '@/features/study-grade'
import type { Grade } from '@/features/study-grade'
import { fetchFlashcards, recordStudy } from '@/features/study'
import type { FlashcardQueueCard } from '@/features/study'

// 큐 카드(얇은 응답) → 카드 뷰 매핑. pronunciation·품사·tags 등은 큐 미제공(후속)
function toFlashcard(c: FlashcardQueueCard): FlashcardData {
  const w = c.word ?? ''
  const ex = c.example ?? ''
  const i = w ? ex.toLowerCase().indexOf(w.toLowerCase()) : -1
  const example =
    i >= 0
      ? { pre: ex.slice(0, i), highlight: ex.slice(i, i + w.length), post: ex.slice(i + w.length), translation: '' }
      : { pre: '', highlight: '', post: ex, translation: '' }
  return {
    word: w,
    pronunciation: '',
    conceptEmoji: '📘',
    pos: '',
    meaning: c.contextMeaning ?? '',
    dictNote: '',
    frontTags: [],
    backTags: [],
    example,
  }
}

/** 플래시카드 (F-05) — 10 플래시카드 */
export function FlashcardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [flipped, setFlipped] = useState(false)
  const [idx, setIdx] = useState(0)

  // 직접선택(study-pick)에서 넘어온 cardIds 가 있으면 PICK 모드로 큐 구성
  const cardIds = (location.state as { cardIds?: number[] } | null)?.cardIds
  const mode = cardIds && cardIds.length > 0 ? 'PICK' : 'TODAY'
  const queue = useQuery({
    queryKey: ['flashcards', mode, cardIds ?? []],
    queryFn: () => fetchFlashcards({ mode, cardIds }),
  })
  const list = (queue.data?.cards ?? []).map((c) => ({ id: c.id as number, data: toFlashcard(c) }))
  const total = list.length
  const pos = Math.min(idx, Math.max(0, total - 1))
  const cur = list[pos]

  const record = useMutation({
    mutationFn: (grade: Grade) => recordStudy(cur.id, { activity: 'FLASHCARD', result: grade }),
  })

  const handleGrade = (grade: Grade) => {
    if (cur?.id != null) record.mutate(grade) // 실 학습 기록
    if (pos + 1 >= total) {
      navigate('/card-done')
      return
    }
    setIdx(pos + 1)
    setFlipped(false)
  }

  // 복습할 카드가 없으면(빈 큐) 데모 대신 빈 상태
  if (total === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-secondary)' }}>
        <NavigationBar title="플래시카드" onBack={() => navigate(-1)} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--color-text-tertiary)' }}>
            {queue.isLoading ? '카드를 불러오는 중…' : '복습할 카드가 없어요 — 시험지를 촬영해 카드를 만들어보세요'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--color-bg-secondary)',
      }}
    >
      <NavigationBar
        title="플래시카드"
        onBack={() => navigate(-1)}
        right={
          <span style={{ fontSize: 15, color: 'var(--color-text-brand)' }}>
            {pos + 1} / {total}
          </span>
        }
      />

      <div style={{ padding: '12px var(--spacing-xl) 0' }}>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: 'var(--color-border-default)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${((pos + 1) / total) * 100}%`,
              height: '100%',
              borderRadius: 2,
              background: 'var(--color-brand-primary)',
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px var(--spacing-xl) 0',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-brand-weak)',
            color: 'var(--color-brand-primary)',
          }}
        >
          🧠 3일 뒤 잊을 확률 78%
        </span>
        {!flipped && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-warning-weak)',
              color: 'var(--yellow-900)',
            }}
          >
            ⚡ +10 XP
          </span>
        )}
      </div>

      <div style={{ padding: '16px var(--spacing-xl) 0' }}>
        <FlashcardView data={cur.data} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
      </div>

      <div style={{ marginTop: 'auto', padding: '0 var(--spacing-xl) 8px' }}>
        <GradeButtons onGrade={handleGrade} />
      </div>

      <p
        style={{
          margin: 0,
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--color-text-tertiary)',
          padding: '8px var(--spacing-xl) 24px',
        }}
      >
        {flipped
          ? '알아요 → Box 3 (7일 뒤 복습) · 소요 시간 자동 기록 중 ⏱ 4.2초'
          : '복습할수록 잊는 간격이 늘어나요 — 너에게 맞춘 다음 복습일로'}
      </p>
    </div>
  )
}
