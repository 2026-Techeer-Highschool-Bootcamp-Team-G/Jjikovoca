import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { NavigationBar, StudyLoading } from '@/shared/ui'
import { mediaUrl } from '@/shared/api'
import { GradeButtons } from '@/features/study-grade'
import type { Grade } from '@/features/study-grade'
import { fetchFlashcards, recordStudy } from '@/features/study'
import type { FlashcardQueueCard } from '@/features/study'
import type { GameResultItem } from '@/features/game-result'
import { FlashCard, generateMnemonic } from '@/entities/card'
import type { FlashCardModel } from '@/entities/card'

// 큐 카드 → 공용 플래시카드 모델(앞: 예문+해석 / 뒤: 뜻). 부가 필드는 백엔드 제공(기존 카드는 null)
function toModel(c: FlashcardQueueCard): FlashCardModel {
  const tags = (c.tags ?? []).map((t, idx) => ({ label: t, tone: idx === 0 ? ('grey' as const) : ('blue' as const) }))
  return {
    word: c.word ?? '',
    pronunciation: c.pronunciation ?? undefined,
    imageUrl: c.mnemonicImagePath ? mediaUrl(c.mnemonicImagePath) : null,
    emoji: c.emoji ?? undefined,
    tags,
    example: c.example ?? undefined,
    exampleTranslation: c.exampleMeaning ?? undefined,
    meaning: c.contextMeaning ?? undefined,
    pos: c.pos ?? undefined,
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
  const list = (queue.data?.cards ?? []).map((c) => ({ id: c.id as number, data: toModel(c) }))
  const total = list.length
  const pos = Math.min(idx, Math.max(0, total - 1))
  const cur = list[pos]

  // 카드 표시~채점 소요시간(durationMs) 측정 — 리포트 학습 시간 집계 원천(study_log). 새 카드마다 리셋
  const shownAt = useRef(performance.now())
  useEffect(() => {
    shownAt.current = performance.now()
  }, [cur?.id])

  const record = useMutation({
    mutationFn: ({ grade, durationMs }: { grade: Grade; durationMs: number }) =>
      recordStudy(cur.id, { activity: 'FLASHCARD', result: grade, durationMs }),
  })

  // 게임 세션 누적(엔딩 종합용) — 각 카드 grade/획득XP. 리렌더 불필요라 ref 로 보관
  const session = useRef<{ items: GameResultItem[]; totalXp: number; levelUp: boolean }>({ items: [], totalXp: 0, levelUp: false })

  // AI 연상 이미지 온디맨드 생성 — 생성된 경로는 카드별로 보관해 즉시 반영(쿼터 초과 시 이모지 폴백 유지)
  const [genMap, setGenMap] = useState<Record<number, string>>({})
  const mnemonic = useMutation({
    mutationFn: (cardId: number) => generateMnemonic(cardId),
    onSuccess: (r, cardId) => setGenMap((m) => ({ ...m, [cardId]: r.mnemonicImagePath })),
  })

  const handleGrade = async (grade: Grade) => {
    const durationMs = Math.round(performance.now() - shownAt.current)
    let earnedXp = 0
    if (cur?.id != null) {
      try {
        const res = await record.mutateAsync({ grade, durationMs }) // 실 학습 기록(+소요시간, exp)
        earnedXp = res.exp?.earned ?? 0
        session.current.totalXp += earnedXp
        if (res.exp?.levelUp) session.current.levelUp = true
      } catch {
        // 기록 실패해도 게임 흐름은 유지(earnedXp=0)
      }
    }
    const items = [...session.current.items, { cardId: cur?.id ?? 0, grade, earnedXp }]
    session.current.items = items
    if (pos + 1 >= total) {
      navigate('/game-result', {
        state: { type: 'FLASHCARD', items, totalXp: session.current.totalXp, levelUp: session.current.levelUp },
      })
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
        {queue.isLoading ? (
          <StudyLoading />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--color-text-tertiary)' }}>
              복습할 카드가 없어요 — 시험지를 촬영해 카드를 만들어보세요
            </p>
          </div>
        )}
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
        <FlashCard
          card={genMap[cur.id] ? { ...cur.data, imageUrl: mediaUrl(genMap[cur.id]) } : cur.data}
          flipped={flipped}
          onFlip={() => setFlipped((f) => !f)}
          onGenerate={() => cur?.id != null && mnemonic.mutate(cur.id)}
          generating={mnemonic.isPending && mnemonic.variables === cur.id}
          genError={mnemonic.isError && mnemonic.variables === cur.id}
        />
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
