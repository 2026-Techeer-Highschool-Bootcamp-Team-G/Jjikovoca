import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { NavigationBar, Button } from '@/shared/ui'
import { MathProblemCard, AnswerInput, fetchMathQueue, judgeMath } from '@/features/math-review'
import type { MathProblem, MathJudge } from '@/features/math-review'

const pageStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  background: 'var(--color-bg-secondary)',
}

/** 12-3 수학 복습 — 정답 입력 (F-26). 정답은 서버만 보유 → 반드시 서버 판정 */
export function MathAnswerPage() {
  const navigate = useNavigate()
  const [answer, setAnswer] = useState('')

  // 실 큐 조회 — 실 카드는 answerValue 미제공(비노출) → 판정은 항상 서버
  const queue = useQuery({ queryKey: ['math'], queryFn: () => fetchMathQueue() })
  const card = queue.data?.[0] ?? null

  const judge = useMutation({
    mutationFn: (): Promise<MathJudge> => judgeMath(card!.cardId, answer.trim()),
    onSuccess: (r) =>
      navigate(r.correct ? '/math-verdict-correct' : '/math-verdict-wrong', {
        state: { judge: r, answer: answer.trim(), title: card?.latex ?? '' },
      }),
  })

  // 풀 문제가 없으면(빈 큐) 데모 대신 빈 상태
  if (!card) {
    return (
      <div style={pageStyle}>
        <NavigationBar title="수학" onBack={() => navigate(-1)} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--color-text-tertiary)' }}>
            {queue.isLoading ? '문제를 불러오는 중…' : '복습할 수학 문제가 없어요 — 문제를 먼저 촬영해보세요'}
          </p>
        </div>
      </div>
    )
  }

  const view: MathProblem = { title: card.latex, tags: [{ label: '수학', tone: 'grey' }], steps: [], answerValue: '', explanation: '' }

  return (
    <div style={pageStyle}>
      <NavigationBar
        title="수학"
        onBack={() => navigate(-1)}
        right={<span style={{ fontSize: 15, color: 'var(--color-text-brand)' }}>1 / {queue.data?.length ?? 1}</span>}
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
