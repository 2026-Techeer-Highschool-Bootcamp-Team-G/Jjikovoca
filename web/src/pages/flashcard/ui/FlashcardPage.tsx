import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { NavigationBar, StudyLoading, Button } from '@/shared/ui'
import { mediaUrl } from '@/shared/api'
import { GradeButtons } from '@/features/study-grade'
import type { Grade } from '@/features/study-grade'
import { fetchFlashcards, recordStudy } from '@/features/study'
import type { FlashcardQueueCard } from '@/features/study'
import type { GameResultItem } from '@/features/game-result'
import { FlashCard } from '@/entities/card'
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
  const [combo, setCombo] = useState(0) // 알아요 연속 수 — 우측 상단 콤보 뱃지(2연속↑)
  const [graduated, setGraduated] = useState<{ word: string } | null>(null) // 졸업(알아요 4연속) 축하 오버레이

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

  // 다음 카드로 진행(마지막이면 결과 종합 엔딩으로). 졸업 오버레이 확인 후에도 이 함수로 이어간다.
  const advance = () => {
    if (pos + 1 >= total) {
      navigate('/game-result', {
        state: { type: 'FLASHCARD', items: session.current.items, totalXp: session.current.totalXp, levelUp: session.current.levelUp },
      })
      return
    }
    setIdx(pos + 1)
    setFlipped(false)
  }

  const handleGrade = async (grade: Grade) => {
    const durationMs = Math.round(performance.now() - shownAt.current)
    let earnedXp = 0
    let didGraduate = false
    if (cur?.id != null) {
      try {
        const res = await record.mutateAsync({ grade, durationMs }) // 실 학습 기록(+소요시간, exp)
        earnedXp = res.exp?.earned ?? 0
        session.current.totalXp += earnedXp
        if (res.exp?.levelUp) session.current.levelUp = true
        if (res.graduated) didGraduate = true // 알아요 4연속 졸업
      } catch {
        // 기록 실패해도 게임 흐름은 유지(earnedXp=0)
      }
    }
    session.current.items = [...session.current.items, { cardId: cur?.id ?? 0, grade, earnedXp }]
    setCombo((c) => (grade === 'KNOW' ? c + 1 : 0))
    if (didGraduate) {
      setGraduated({ word: cur.data.word }) // 졸업 즉시 축하 — '다음 카드'까지 진행 보류
      return
    }
    advance()
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

      {/* 카드 + 콤보 뱃지(우측 상단, 알아요 2연속↑) */}
      <div style={{ padding: '16px var(--spacing-xl) 0', position: 'relative' }}>
        {combo >= 2 && (
          <span
            style={{
              position: 'absolute',
              top: 8,
              right: 28,
              zIndex: 5,
              fontSize: 12,
              fontWeight: 900,
              color: 'var(--color-on-accent)',
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-strong))',
              padding: '4px 11px',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 4px 10px rgba(245,182,56,0.4)',
              animation: 'jjik-pop-spring 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.2) both',
            }}
          >
            🔥 {combo}콤보
          </span>
        )}
        <FlashCard card={cur.data} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
      </div>

      <div style={{ marginTop: 'auto', padding: '0 var(--spacing-xl) 24px' }}>
        <GradeButtons onGrade={handleGrade} />
      </div>

      {graduated && (
        <GraduationOverlay
          word={graduated.word}
          onNext={() => {
            setGraduated(null)
            advance()
          }}
        />
      )}
    </div>
  )
}

// 졸업 축하 컨페티 조각 — 중심에서 바깥으로 튀어 흩어진다
const CONFETTI = [
  { tx: '-64px', ty: '-52px', r: '-140deg', c: 'var(--color-brand-primary)', d: '0.15s' },
  { tx: '58px', ty: '-58px', r: '160deg', c: '#f5a623', d: '0.2s' },
  { tx: '-78px', ty: '10px', r: '-90deg', c: '#1bc1bd', d: '0.1s' },
  { tx: '80px', ty: '2px', r: '120deg', c: '#e5484d', d: '0.25s' },
  { tx: '-40px', ty: '58px', r: '-60deg', c: '#f5a623', d: '0.28s' },
  { tx: '46px', ty: '62px', r: '90deg', c: 'var(--color-brand-primary)', d: '0.18s' },
  { tx: '6px', ty: '-82px', r: '40deg', c: '#1bc1bd', d: '0.22s' },
  { tx: '-8px', ty: '80px', r: '-30deg', c: '#e5484d', d: '0.12s' },
] as const

// 졸업(알아요 4연속) 축하 오버레이 — 실제 졸업 단어 연동, [다음 카드]만(공유 없음)
function GraduationOverlay({ word, onNext }: { word: string; onNext: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'linear-gradient(180deg, #fff9e7 0%, var(--color-bg-primary) 55%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 24px' }}>
        {/* 졸업모 + 컨페티 */}
        <div style={{ width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, #fff2c4 0%, rgba(255,255,255,0) 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }} aria-hidden>
          {CONFETTI.map((p, i) => (
            <span
              key={i}
              style={
                {
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: p.c,
                  '--tx': p.tx,
                  '--ty': p.ty,
                  '--r': p.r,
                  animation: `jjik-confetti-burst 0.9s ease-out ${p.d} both`,
                } as CSSProperties
              }
            />
          ))}
          <span style={{ fontSize: 72, lineHeight: 1, animation: 'jjik-pop-spring 0.6s cubic-bezier(0.2,0.9,0.3,1.2) both' }}>🎓</span>
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 24,
            padding: '0 var(--spacing-sm)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-success-primary)',
            color: 'var(--color-text-inverse)',
            fontSize: 12,
            fontWeight: 500,
            animation: 'jjik-rise-in 0.5s ease-out 0.2s both',
          }}
        >
          졸업 🎓
        </span>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', animation: 'jjik-rise-in 0.5s ease-out 0.3s both' }}>
          ‘{word}’ 카드 졸업!
        </h1>
        <p style={{ margin: 0, textAlign: 'center', fontSize: 15, lineHeight: 1.5, color: 'var(--color-text-secondary)', animation: 'jjik-rise-in 0.5s ease-out 0.4s both' }}>
          알아요 4번 연속! 이제 이 단어는
          <br />
          피드에서 조용히 쉬러 갑니다
        </p>
      </div>

      <div style={{ background: 'var(--color-bg-primary)', padding: '12px var(--spacing-xl) 32px' }}>
        <Button size="lg" block onClick={onNext}>
          다음 카드
        </Button>
      </div>
    </div>
  )
}
