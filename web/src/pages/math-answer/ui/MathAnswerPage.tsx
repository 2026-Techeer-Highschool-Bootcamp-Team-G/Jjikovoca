import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { NavigationBar, Button } from '@/shared/ui'
import { MathProblemCard, AnswerInput } from '@/features/math-review'
import type { MathProblem } from '@/features/math-review'

const INDEX = 3
const TOTAL = 8

// 프로토타입 12-3 수학 복습 — 정답 입력 (137:803)과 동일. 정답 입력이 채워진 상태를 고정 렌더.
const problem: MathProblem = {
  title: 'x² − 5x + 6 = 0 의 두 근을 구하시오.',
  tags: [
    { label: '수학', tone: 'grey' },
    { label: '이차방정식 · 인수분해', tone: 'blue' },
  ],
  wrongCount: 2,
  steps: [],
  answerValue: '2, 3',
  explanation:
    '곱해서 6, 더해서 −5가 되는 두 수는 −2와 −3. 따라서 (x−2)(x−3) = 0 → x = 2 또는 x = 3이에요. 이항할 땐 부호가 바뀐다는 것만 기억하면 완벽!',
}

const pageStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  background: 'var(--color-bg-secondary)',
}

// F-26 NUMERIC 판정 — 콤마/공백 구분, 순서 무관 집합 비교
const normalize = (v: string) =>
  v
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .sort()
    .join(',')

/** 12-3 수학 복습 — 정답 입력 (F-26) — 숫자 답 입력 단계 */
export function MathAnswerPage() {
  const navigate = useNavigate()
  const [answer, setAnswer] = useState('2, 3')
  const isCorrect = normalize(answer) === normalize(problem.answerValue ?? '')

  return (
    <div style={pageStyle}>
      <NavigationBar
        title="수학"
        onBack={() => navigate(-1)}
        right={
          <span style={{ fontSize: 15, color: 'var(--color-text-brand)' }}>
            {INDEX} / {TOTAL}
          </span>
        }
      />

      <div
        style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: '12px var(--spacing-xl)' }}
      >
        <MathProblemCard problem={problem} slim />
        <AnswerInput value={answer} onChange={setAnswer} />

        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          <Button
            block
            size="lg"
            onClick={() => navigate(isCorrect ? '/math-verdict-correct' : '/math-verdict-wrong')}
            disabled={!answer.trim()}
            style={{ opacity: answer.trim() ? 1 : 0.4 }}
          >
            정답 확인
          </Button>
        </div>
      </div>
    </div>
  )
}
