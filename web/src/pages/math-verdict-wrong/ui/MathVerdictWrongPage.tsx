import { useNavigate, useLocation } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { NavigationBar } from '@/shared/ui'
import { MathProblemCard, VerdictView } from '@/features/math-review'
import type { MathProblem, MathJudge } from '@/features/math-review'
import { GradeButtons } from '@/features/study-grade'
import type { Grade } from '@/features/study-grade'

const INDEX = 3
const TOTAL = 8

// 프로토타입 12-5 수학 복습 — 판정 오답 (79:678)과 동일. 오답 판정 결과를 고정 렌더.
const problem: MathProblem = {
  title: 'x² − 5x + 6 = 0 의 두 근을 구하시오.',
  tags: [
    { label: '수학', tone: 'grey' },
    { label: '이차방정식 · 인수분해', tone: 'blue' },
  ],
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

/** 12-5 수학 복습 — 판정 오답 (F-26) — 오답 판정 결과 화면 (내 답: −2, −3) */
export function MathVerdictWrongPage() {
  const navigate = useNavigate()
  const handleGrade = (_grade: Grade) => navigate(-1)
  // 판정 결과(정답·해설·내 답)는 MathAnswerPage 판정 응답에서 전달받음. 없으면 데모 폴백
  const { state } = useLocation() as { state: { judge?: MathJudge; answer?: string; title?: string } | null }
  const answerValue = state?.judge?.answerValue ?? problem.answerValue
  const explanation = state?.judge?.solutions?.[0]?.explanation ?? problem.explanation
  const enteredAnswer = state?.answer ?? '−2, −3'
  const view: MathProblem = state?.title ? { ...problem, title: state.title } : problem

  return (
    <div style={pageStyle}>
      <NavigationBar
        title="수학 복습"
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
        <MathProblemCard problem={view} slim />
        <VerdictView correct={false} answerValue={answerValue} explanation={explanation} enteredAnswer={enteredAnswer} />

        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          <GradeButtons onGrade={handleGrade} />
          <p style={{ margin: '8px 0 0', textAlign: 'center', fontSize: 11, color: 'var(--grey-500)' }}>
            선택에 따라 다음 복습일이 정해져요 — 기억이 오래갈수록 멀리
          </p>
        </div>
      </div>
    </div>
  )
}
