import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { NavigationBar, Button, StudyLoading } from '@/shared/ui'
import { fetchClozeQueue, submitClozeAnswer, regenerateCloze } from '@/features/cloze'
import type { ClozeJudge } from '@/features/cloze'
import type { Grade } from '@/features/study-grade'
import type { GameResultItem } from '@/features/game-result'

// 콤보 불꽃 단계 — 콤보가 높을수록 불꽃이 많아지고 빠르게 타오른다
function flameLevel(combo: number) {
  return combo < 3 ? 0 : combo < 5 ? 1 : combo < 7 ? 2 : 3
}

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
  const [shakeKey, setShakeKey] = useState(0) // 빈 입력 클릭마다 증가 → 버튼 흔들림 재실행
  // AI 재생성한 예문 오버라이드 (cardId → 새 clozeText/hints)
  const [overrides, setOverrides] = useState<Record<number, { clozeText: string; hints: string[] }>>({})
  // 게임 세션 누적(엔딩 종합용) — 힌트 사용 여부로 grade 도출
  const session = useRef<{ items: GameResultItem[]; totalXp: number; levelUp: boolean }>({ items: [], totalXp: 0, levelUp: false })
  const comboVibrated = useRef(false) // 콤보 5 축하 진동 1회만

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
      navigator.vibrate?.(r.correct ? 80 : [30, 20, 30]) // 정답/오답 햅틱
      // 백엔드 combo 우선, 미배포면 클라 추정(정답 +1 / 오답 0)
      const nextCombo = r.combo ?? (r.correct ? combo + 1 : 0)
      setCombo(nextCombo)
      if (nextCombo >= 5 && !comboVibrated.current) {
        comboVibrated.current = true
        navigator.vibrate?.([40, 30, 40]) // 콤보 5 축하 진동(1회)
      }
      if (nextCombo < 5) comboVibrated.current = false
      // 힌트 사용 여부로 grade 도출: 무힌트 정답=알아요 / 힌트 정답=헷갈려요 / 오답=몰라요
      const grade: Grade = r.correct ? (revealed.size > 0 ? 'CONFUSED' : 'KNOW') : 'DONT_KNOW'
      const earnedXp = r.exp?.earned ?? 0
      session.current.items = [...session.current.items, { cardId: cur.cardId, grade, earnedXp, correct: r.correct }]
      session.current.totalXp += earnedXp
      if (r.exp?.levelUp) session.current.levelUp = true
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

  const onSubmitClick = () => {
    if (!guess.trim()) {
      // 빈 입력 — 안내 + 버튼 흔들림 + 햅틱
      setShakeKey((k) => k + 1)
      navigator.vibrate?.([40, 40, 40])
      return
    }
    if (!submit.isPending) submit.mutate()
  }

  const next = () => {
    if (pos + 1 >= total) {
      navigate('/game-result', {
        state: { type: 'CLOZE', items: session.current.items, totalXp: session.current.totalXp, levelUp: session.current.levelUp },
      })
      return
    }
    setIdx(pos + 1)
    setGuess('')
    setRevealed(new Set())
    setResult(null)
    setShakeKey(0)
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
  const showEmptyWarn = shakeKey > 0 && !guess.trim() && !answered

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

        {/* 문장 카드 — 재생성 중이면 로딩 오브로 교체 (콤보 뱃지 플로팅) */}
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
          {combo >= 2 && <ComboBadge combo={combo} />}
          {regen.isPending ? (
            <RegenLoading />
          ) : (
            <>
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
            </>
          )}
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

        {!answered &&
          (showEmptyWarn ? (
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-danger)', textAlign: 'center' }}>
              정답을 입력해주세요
            </span>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
              힌트를 참고해 직접 입력하세요
            </span>
          ))}

        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          {!answered ? (
            // 빈 입력 클릭마다 wrapper 를 재마운트(key)해 흔들림 애니메이션을 다시 실행
            <div key={shakeKey} style={{ animation: shakeKey > 0 ? 'jjik-error-shake 0.4s ease-in-out' : undefined }}>
              <Button block size="lg" onClick={onSubmitClick} disabled={submit.isPending}>
                {submit.isPending ? '채점 중…' : '입력 하기'}
              </Button>
            </div>
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

// 콤보 뱃지 — 콤보 단계별 불꽃(개수·타오름 강도). 콤보 높을수록 활활
function ComboBadge({ combo }: { combo: number }) {
  const level = flameLevel(combo)
  const count = level === 0 ? 1 : level + 1 // 1·2·3·4개
  const dur = 0.9 - level * 0.18 // level↑ → 빠르게 타오름
  return (
    <span
      style={{
        position: 'absolute',
        top: -12,
        right: 12,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
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
      <span style={{ display: 'inline-flex' }} aria-hidden>
        {Array.from({ length: count }, (_, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              animation: level > 0 ? `jjik-flame ${dur}s ease-in-out ${i * 0.12}s infinite` : undefined,
            }}
          >
            🔥
          </span>
        ))}
      </span>
      {combo}콤보
    </span>
  )
}

// "다른 예문으로" 재생성 로딩 — 예문 만드는 중 미니 오브(AnalyzingOrb 축소)
function RegenLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '10px 0' }} aria-hidden>
      <div style={{ position: 'relative', width: 96, height: 96 }}>
        {/* 숨쉬는 글로우 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(49,130,246,0.18) 0%, rgba(255,255,255,0) 68%)',
            animation: 'jjik-breathe 2.4s ease-in-out infinite',
          }}
        />
        {/* 회전 스캔 링(도넛) */}
        <div
          style={{
            position: 'absolute',
            inset: 14,
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, rgba(49,130,246,0) 0%, rgba(49,130,246,0.65) 28%, rgba(49,130,246,0) 55%)',
            WebkitMaskImage: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
            maskImage: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
            animation: 'jjik-spin 1.5s linear infinite',
          }}
        />
        {/* 궤도 스파클 2개 */}
        {[0, 1].map((i) => (
          <div key={i} style={{ position: 'absolute', inset: 0, animation: 'jjik-spin 3s linear infinite', animationDelay: `${-i * 1.5}s` }}>
            <span style={{ position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: '#ffd84d', filter: 'drop-shadow(0 0 4px rgba(255,216,77,0.85))', animation: 'jjik-twinkle 1s ease-in-out infinite' }}>
              ✦
            </span>
          </div>
        ))}
        {/* 중앙 글리프 */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 34, animation: 'jjik-float 2.2s ease-in-out infinite' }}>✨</span>
        </div>
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>새 예문을 만들고 있어요…</span>
    </div>
  )
}

// 정답/오답 해설 — 숙어·뜻·예문 속 쓰임·Box 이동 + XP 인터랙션(정답 시 큰 +XP + 성공 링 + 스파클)
function ResultBox({ r }: { r: ClozeJudge }) {
  const earned = r.exp?.earned ?? 0
  const showXp = r.correct && earned > 0
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
      {/* 정답 시 배경 링 퍼짐 */}
      {r.correct && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: 14,
            left: 24,
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: '2px solid var(--color-success-primary)',
            animation: 'jjik-success-ring 0.7s ease-out 0.1s both',
          }}
        />
      )}
      {/* 정답 XP 인터랙션 — 크게 떠오르는 +XP + 양옆 스파클 */}
      {showXp && (
        <span
          style={{
            position: 'absolute',
            top: -18,
            right: 10,
            fontSize: 15,
            fontWeight: 900,
            color: 'var(--color-on-accent)',
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-strong))',
            padding: '6px 13px',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 6px 14px rgba(245,182,56,0.45)',
            animation: 'jjik-xp-rise 0.7s ease-out both',
          }}
        >
          <span style={{ position: 'absolute', top: -6, left: -8, fontSize: 11, color: '#ffd84d', animation: 'jjik-twinkle 0.8s ease-in-out infinite' }} aria-hidden>✦</span>
          <span style={{ position: 'absolute', bottom: -4, right: -6, fontSize: 9, color: '#ffd84d', animation: 'jjik-twinkle 0.8s ease-in-out 0.3s infinite' }} aria-hidden>✦</span>
          +{earned} XP
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: r.correct ? '#0a8a55' : 'var(--color-danger-primary)' }}>
          {r.correct ? '✓ 정답이에요!' : `✗ 아쉬워요, 정답은 ${r.word}에요`}
        </span>
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
