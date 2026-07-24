import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { NavigationBar, Button, TextField } from '@/shared/ui'
import { fetchClozeQueue, submitClozeAnswer } from '@/features/cloze'
import type { ClozeJudge } from '@/features/cloze'

/** 빈칸 퀴즈 (F-06) — 주관식 입력 + 서버 판정(정답은 서버만 보유, 클라 미내장) */
export function ClozePage() {
  const navigate = useNavigate()
  const [idx, setIdx] = useState(0)
  const [guess, setGuess] = useState('')
  const [hintCount, setHintCount] = useState(1)
  const [result, setResult] = useState<ClozeJudge | null>(null)

  // 실 큐 조회 — 정답 미포함(치팅 방지). 판정은 항상 서버
  const queue = useQuery({ queryKey: ['cloze'], queryFn: () => fetchClozeQueue() })
  const list = queue.data ?? []
  const total = list.length
  const pos = Math.min(idx, Math.max(0, total - 1))
  const cur = list[pos]

  const submit = useMutation({
    mutationFn: (): Promise<ClozeJudge> => submitClozeAnswer(cur.cardId, guess.trim()),
    onSuccess: (r) => setResult(r),
  })

  const next = () => {
    if (pos + 1 >= total) {
      navigate('/wrong-note')
      return
    }
    setIdx(pos + 1)
    setGuess('')
    setHintCount(1)
    setResult(null)
  }

  // 풀 문항이 없으면(빈 큐) 데모 대신 빈 상태
  if (total === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-secondary)' }}>
        <NavigationBar title="빈칸 퀴즈" onBack={() => navigate(-1)} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--color-text-tertiary)' }}>
            {queue.isLoading ? '문항을 불러오는 중…' : '풀 빈칸 문항이 없어요 — 단어 카드를 먼저 만들어보세요'}
          </p>
        </div>
      </div>
    )
  }

  const [before, after] = cur.clozeText.split('_')

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
        title="빈칸 퀴즈"
        onBack={() => navigate(-1)}
        right={
          <span style={{ fontSize: 15, color: 'var(--color-text-brand)' }}>
            {pos + 1} / {total}
          </span>
        }
      />

      <div style={{ padding: '12px var(--spacing-xl) 0' }}>
        <div style={{ height: 4, borderRadius: 2, background: 'var(--color-border-default)', overflow: 'hidden' }}>
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: '16px var(--spacing-xl)' }}>
        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>빈칸에 들어갈 단어를 입력하세요</span>

        {/* 문장 카드 */}
        <div
          style={{
            background: 'var(--color-bg-elevated)',
            borderRadius: 16,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          }}
        >
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: 'var(--color-text-primary)' }}>
            {before}
            <Blank word={result?.word} correct={result?.correct} />
            {after}
          </p>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>💡 {cur.meaning}</span>
        </div>

        {/* 힌트 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {cur.hints.slice(0, hintCount).map((h, i) => (
            <span
              key={i}
              style={{
                fontSize: 12,
                fontWeight: 500,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-brand-weak)',
                color: 'var(--color-brand-primary)',
              }}
            >
              힌트 {i + 1}: {h}
            </span>
          ))}
          {!result && hintCount < cur.hints.length && (
            <button
              type="button"
              onClick={() => setHintCount((n) => n + 1)}
              style={{
                fontSize: 12,
                fontWeight: 500,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'transparent',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              + 힌트 보기
            </button>
          )}
        </div>

        {/* 입력 or 결과 */}
        {!result ? (
          <TextField value={guess} onChange={setGuess} placeholder="단어를 입력하세요" />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              padding: '14px 16px',
              borderRadius: 12,
              background: result.correct ? 'var(--color-success-weak)' : 'var(--color-danger-weak)',
              // 정답 시 토스식 스프링 팝, 오답은 부드러운 등장
              animation: result.correct
                ? 'jjik-pop-spring 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.2) both'
                : 'jjik-rise-in 0.4s ease-out both',
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: result.correct ? '#0a8a55' : 'var(--color-danger-primary)',
              }}
            >
              {result.correct ? '정답이에요! 🎉' : '아쉬워요'}
            </span>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              정답: <b style={{ color: 'var(--color-text-primary)' }}>{result.word}</b>
              {!result.correct && ' · 이 카드는 Box 0으로 이동, 내일 다시 만나요'}
            </span>
          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          {!result ? (
            <Button block size="lg" onClick={() => submit.mutate()} disabled={guess.trim() === '' || submit.isPending}>
              {submit.isPending ? '채점 중…' : '제출'}
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

// 빈칸 — 미제출은 밑줄 박스, 제출 후엔 정답 단어(정답 초록/오답 빨강)
function Blank({ word, correct }: { word?: string; correct?: boolean }) {
  if (word) {
    return <b style={{ color: correct ? '#0a8a55' : 'var(--color-danger-primary)', fontWeight: 700 }}>{word}</b>
  }
  return (
    <span
      style={{
        display: 'inline-block',
        minWidth: 64,
        borderBottom: '2px solid var(--color-brand-primary)',
        margin: '0 4px',
      }}
      aria-hidden
    />
  )
}
