import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { NavigationBar, Button, StudyLoading } from '@/shared/ui'
import { fetchClozeQueue, submitClozeAnswer, regenerateCloze } from '@/features/cloze'
import type { ClozeJudge } from '@/features/cloze'

/** 빈칸 퀴즈 (F-06) — 인라인 빈칸 입력 + 서버 판정. 콤보·XP·해설은 백엔드 응답(optional) */
export function ClozePage() {
  const navigate = useNavigate()
  const location = useLocation()
  // 직접 선택(study-pick)에서 넘어온 cardIds — PICK 학습(백엔드 cardIds 미지원 시 일반 큐)
  const cardIds = (location.state as { cardIds?: number[] } | null)?.cardIds
  const [idx, setIdx] = useState(0)
  const [guess, setGuess] = useState('')
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [result, setResult] = useState<ClozeJudge | null>(null)
  const [combo, setCombo] = useState(0) // 연속 정답(백엔드 combo 우선). 오답 시 0
  // AI 재생성한 예문 오버라이드 (cardId → 새 clozeText/hints)
  const [overrides, setOverrides] = useState<Record<number, { clozeText: string; hints: string[] }>>({})

  // 실 큐 조회 — 정답 미포함(치팅 방지). 판정은 항상 서버
  const queue = useQuery({
    queryKey: ['cloze', cardIds ?? []],
    queryFn: () => fetchClozeQueue(cardIds && cardIds.length > 0 ? { cardIds } : {}),
  })
  const list = queue.data ?? []
  const total = list.length
  const pos = Math.min(idx, Math.max(0, total - 1))
  const cur = list[pos]

  // 문항 표시~제출 소요시간(durationMs) 측정 — 새 문항마다 리셋
  const shownAt = useRef(performance.now())
  useEffect(() => {
    shownAt.current = performance.now()
  }, [cur?.cardId])

  const submit = useMutation({
    // /cloze/answer 가 study_log(CLOZE)+durationMs+exp+combo 단일 주체(BE 확정)
    mutationFn: (): Promise<ClozeJudge> => {
      const durationMs = Math.round(performance.now() - shownAt.current)
      return submitClozeAnswer(cur.cardId, guess.trim(), durationMs)
    },
    onSuccess: (r) => {
      setResult(r)
      // 백엔드 combo 우선, 미배포면 클라 추정(정답 +1 / 오답 0)
      setCombo((prev) => r.combo ?? (r.correct ? prev + 1 : 0))
    },
  })

  // AI 예문 재생성(프리미엄) — 새 clozeText/hints 로 교체
  const regen = useMutation({
    mutationFn: () => regenerateCloze(cur.cardId),
    onSuccess: (r) => {
      setOverrides((o) => ({ ...o, [cur.cardId]: { clozeText: r.clozeText, hints: r.hints } }))
      setRevealed(new Set())
    },
  })

  const next = () => {
    if (pos + 1 >= total) {
      navigate('/wrong-note')
      return
    }
    setIdx(pos + 1)
    setGuess('')
    setRevealed(new Set())
    setResult(null)
  }

  // 풀 문항이 없으면(빈 큐) 데모 대신 빈 상태
  if (total === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-secondary)' }}>
        <NavigationBar title="빈칸 퀴즈" onBack={() => navigate(-1)} />
        {queue.isLoading ? (
          <StudyLoading />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--color-text-tertiary)' }}>
              풀 빈칸 문항이 없어요 — 단어 카드를 먼저 만들어보세요
            </p>
          </div>
        )}
      </div>
    )
  }

  // 재생성 오버라이드가 있으면 그 예문/힌트를 사용
  const item = overrides[cur.cardId] ? { ...cur, ...overrides[cur.cardId] } : cur
  // 백엔드 clozeText 는 빈칸을 밑줄 여러 개(_____)로 표기 → 한 덩어리로 분리
  const [before, after] = item.clozeText.split(/_+/)
  const exampleKo = cur.exampleMeaning // 예문 전체 한글 번역(null 이면 숨김)
  const answered = !!result
  const answerColor = answered ? (result?.correct ? '#0a8a55' : 'var(--color-danger-primary)') : 'var(--color-brand-primary)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-secondary)' }}>
      <NavigationBar
        title="빈칸 퀴즈"
        onBack={() => navigate(-1)}
        right={<span style={{ fontSize: 15, color: 'var(--color-text-brand)' }}>{pos + 1} / {total}</span>}
      />

      <div style={{ padding: '12px var(--spacing-xl) 0' }}>
        <div style={{ height: 4, borderRadius: 2, background: 'var(--color-border-default)', overflow: 'hidden' }}>
          <div style={{ width: `${((pos + 1) / total) * 100}%`, height: '100%', borderRadius: 2, background: 'var(--color-brand-primary)' }} />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, padding: '16px var(--spacing-xl)' }}>
        {/* 안내 + 다른 예문으로 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>빈칸에 들어갈 단어를 고르세요</span>
          <button
            type="button"
            onClick={() => regen.mutate()}
            disabled={regen.isPending || answered}
            style={{
              flexShrink: 0,
              fontSize: 13,
              fontWeight: 700,
              padding: '7px 13px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: 'var(--color-brand-primary)',
              color: 'var(--color-text-inverse)',
              cursor: regen.isPending || answered ? 'default' : 'pointer',
              opacity: regen.isPending || answered ? 0.5 : 1,
            }}
          >
            {regen.isPending ? '생성 중…' : '다른 예문으로'}
          </button>
        </div>
        {regen.isError && (
          <span style={{ fontSize: 12, color: 'var(--color-text-danger)' }}>🔒 프리미엄 전용이거나 오늘 한도를 초과했어요</span>
        )}

        {/* 문장 카드 (콤보 뱃지 플로팅) */}
        <div
          style={{
            position: 'relative',
            background: 'var(--color-bg-elevated)',
            borderRadius: 16,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          }}
        >
          {combo >= 2 && (
            <span
              style={{
                position: 'absolute',
                top: -12,
                right: 12,
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
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.8, color: 'var(--color-text-primary)' }}>
            {before}
            <input
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              readOnly={answered}
              placeholder="______"
              aria-label="빈칸 입력"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && guess.trim() && !answered && !submit.isPending) submit.mutate()
              }}
              style={{
                display: 'inline-block',
                width: `${Math.max(6, guess.length + 1)}ch`,
                minWidth: 72,
                border: 'none',
                borderBottom: `2px solid ${answerColor}`,
                background: 'transparent',
                textAlign: 'center',
                fontSize: 17,
                fontWeight: 700,
                fontFamily: 'inherit',
                color: answerColor,
                outline: 'none',
                padding: '0 4px',
                margin: '0 3px',
              }}
            />
            {after}
          </p>
          {exampleKo && <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{exampleKo}</span>}
        </div>

        {/* 힌트 1~3 슬롯 (클릭 시 공개) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[0, 1, 2].map((i) => {
            const hint = item.hints[i]
            const open = revealed.has(i)
            return (
              <button
                key={i}
                type="button"
                disabled={!hint || open || answered}
                onClick={() => setRevealed((s) => new Set(s).add(i))}
                style={{
                  textAlign: 'left',
                  padding: '11px 14px',
                  borderRadius: 12,
                  border: '1px solid var(--color-border-default)',
                  background: open ? 'var(--color-brand-weak)' : 'var(--color-bg-primary)',
                  color: open ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)',
                  fontSize: 13,
                  fontWeight: open ? 600 : 500,
                  cursor: !hint || open || answered ? 'default' : 'pointer',
                }}
              >
                {open ? hint : `힌트 ${i + 1}`}
              </button>
            )
          })}
        </div>

        {/* 결과 해설 박스 */}
        {result && <ResultBox r={result} />}

        {!answered && (
          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
            힌트를 참고해 직접 입력하세요
          </span>
        )}

        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          {!answered ? (
            <Button block size="lg" onClick={() => submit.mutate()} disabled={guess.trim() === '' || submit.isPending}>
              {submit.isPending ? '채점 중…' : '입력 하기'}
            </Button>
          ) : (
            <Button block size="lg" onClick={next}>
              {pos + 1 >= total ? '완료' : '다음 문제'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// 정답/오답 해설 — 숙어·뜻·예문 속 쓰임·Box 이동 + XP(있으면)
function ResultBox({ r }: { r: ClozeJudge }) {
  const showGold = r.correct && !!r.exp && r.exp.earned > r.exp.base
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        padding: '14px 16px',
        borderRadius: 12,
        background: r.correct ? 'var(--color-success-weak)' : 'var(--color-danger-weak)',
        animation: r.correct
          ? 'jjik-pop-spring 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.2) both'
          : 'jjik-rise-in 0.4s ease-out both',
      }}
    >
      {showGold && (
        <span
          style={{
            position: 'absolute',
            top: -16,
            right: 10,
            fontSize: 14,
            fontWeight: 900,
            color: 'var(--color-on-accent)',
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-strong))',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 6px 14px rgba(245,182,56,0.45)',
            animation: 'jjik-xp-rise 0.6s ease-out both',
          }}
        >
          +{r.exp!.earned} XP
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: r.correct ? '#0a8a55' : 'var(--color-danger-primary)' }}>
          {r.correct ? '✓ 정답이에요!' : `✗ 아쉬워요, 정답은 ${r.word}에요`}
        </span>
        {r.correct && r.exp && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: '#0a8a55',
              background: 'rgba(10,138,85,0.12)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            +{r.exp.base} XP
          </span>
        )}
      </div>

      {r.meaning && (
        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          <b style={{ color: 'var(--color-text-primary)' }}>{r.word}</b> — {r.meaning}
        </span>
      )}

      {r.correct
        ? r.exampleMeaning && (
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              예문 속에서는 “{r.exampleMeaning}”라는 뜻으로 쓰였어요.
            </span>
          )
        : (
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              이 카드는 Box {r.boxLevel}으로 이동 — 내일 다시 만나요 (콤보 리셋)
            </span>
          )}
    </div>
  )
}
