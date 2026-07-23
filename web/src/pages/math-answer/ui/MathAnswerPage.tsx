import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { NavigationBar, Button } from '@/shared/ui'
import { MathProblemCard, AnswerInput, fetchMathQueue, judgeMath } from '@/features/math-review'
import type { MathProblem, MathJudge } from '@/features/math-review'

// 프로토타입 12-3 데모 (정답 입력이 채워진 상태) + 폴백 로컬 판정용 정답
const demo: MathProblem = {
  title: 'x² − 5x + 6 = 0 의 두 근을 구하시오.',
  tags: [
    { label: '수학', tone: 'grey' },
    { label: '이차방정식 · 인수분해', tone: 'blue' },
  ],
  wrongCount: 2,
  steps: [],
  answerValue: '2, 3',
  explanation: '',
}

const pageStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  background: 'var(--color-bg-secondary)',
}

// F-26 NUMERIC 판정(폴백) — 콤마/공백 구분, 순서 무관 집합 비교
const normalize = (v: string) =>
  v
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .sort()
    .join(',')

/** 12-3 수학 복습 — 정답 입력 (F-26) — 서버 판정 후 정답/오답 화면 이동 */
export function MathAnswerPage() {
  const navigate = useNavigate()
  const [answer, setAnswer] = useState('2, 3')

  // 실 큐 조회 — 미가동 시 데모 폴백. 실 카드는 answerValue 미제공이라 반드시 서버 판정
  const queue = useQuery({ queryKey: ['math'], queryFn: () => fetchMathQueue(), retry: 0 })
  const card = queue.data?.[0] ?? null
  const cardId = card?.cardId ?? -1
  const view: MathProblem = card
    ? { title: card.latex, tags: [{ label: '수학', tone: 'grey' }], steps: [], answerValue: '', explanation: '' }
    : demo

  const judge = useMutation({
    mutationFn: (): Promise<MathJudge> => {
      const a = answer.trim()
      if (card) return judgeMath(cardId, a)
      const ok = normalize(a) === normalize(demo.answerValue ?? '')
      return Promise.resolve({ correct: ok, answerValue: demo.answerValue, solutions: [] })
    },
    onSuccess: (r) =>
      navigate(r.correct ? '/math-verdict-correct' : '/math-verdict-wrong', {
        state: { judge: r, answer: answer.trim(), title: view.title },
      }),
  })

  return (
    <div style={pageStyle}>
      <NavigationBar
        title="수학"
        onBack={() => navigate(-1)}
        right={<span style={{ fontSize: 15, color: 'var(--color-text-brand)' }}>1 / {queue.data?.length ?? 8}</span>}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: '12px var(--spacing-xl)' }}>
        <MathProblemCard problem={view} slim />
        <AnswerInput value={answer} onChange={setAnswer} />

        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          <Button
            block
            size="lg"
            onClick={() => judge.mutate()}
            disabled={!answer.trim() || judge.isPending}
            style={{ opacity: answer.trim() ? 1 : 0.4 }}
          >
            {judge.isPending ? '채점 중…' : '정답 확인'}
          </Button>
        </div>
      </div>
    </div>
  )
}
