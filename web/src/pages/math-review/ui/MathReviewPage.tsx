import { useNavigate } from 'react-router-dom'
import { NavigationBar, Button } from '@/shared/ui'
import {
  useMathReview,
  MathProblemCard,
  DiagnosisBanner,
  StepAccordion,
  AnswerInput,
  VerdictView,
} from '@/features/math-review'
import type { MathProblem } from '@/features/math-review'
import { GradeButtons } from '@/features/study-grade'
import type { Grade } from '@/features/study-grade'

const INDEX = 3
const TOTAL = 8

// 백엔드 연결 전 데모 (프로토타입 12 수학 복습과 동일)
const problem: MathProblem = {
  title: 'x² − 5x + 6 = 0 의 두 근을 구하시오.',
  tags: [
    { label: '수학', tone: 'grey' },
    { label: '이차방정식 · 인수분해', tone: 'blue' },
  ],
  wrongCount: 2,
  diagnosis: { failedStep: 3, description: '3단계 이항에서 부호 실수가 있었어요. 이 단계 주의!' },
  steps: [
    {
      no: 1,
      title: '무엇을 구하는 문제인가요?',
      question: '무엇을 구하는 문제인가요?',
      content: 'x² − 5x + 6 = 0을 만족하는 x, 즉 이차방정식의 두 근을 구하는 문제예요.',
    },
    {
      no: 2,
      title: '어떤 개념을 적용할까요?',
      question: '어떤 개념을 적용할까요?',
      content: '좌변을 (x−a)(x−b) 꼴로 바꾸는 인수분해 — 곱해서 6, 더해서 −5가 되는 두 수를 찾아요.',
    },
    {
      no: 3,
      title: '이항할 때 부호는 어떻게 될까요?',
      question: '이항할 때 부호는 어떻게 될까요?',
      content: '이항 없이 그대로 인수분해하면 (x−2)(x−3) = 0. 지난번엔 여기서 부호가 뒤집혔어요.',
    },
    {
      no: 4,
      title: '구한 근을 검산해 볼까요?',
      question: '구한 근을 검산해 볼까요?',
      content: 'x = 2, 3을 원식에 대입하면 좌변이 둘 다 0 — 근이 맞아요.',
    },
  ],
  answerValue: '2, 3',
  explanation:
    '곱해서 6, 더해서 −5가 되는 두 수는 −2와 −3. 따라서 (x−2)(x−3) = 0 → x = 2 또는 x = 3이에요. 이항할 땐 부호가 바뀐다는 것만 기억하면 완벽!',
}

/** 수학 사고과정 복습 (F-26) — 12 수학 복습 (사고 단계 → 정답 입력 → 판정) */
export function MathReviewPage() {
  const navigate = useNavigate()
  const { phase, openSteps, toggleStep, answer, setAnswer, correct, goAnswer, submit } =
    useMathReview(problem)

  const handleGrade = (_grade: Grade) => {
    navigate(-1) // v2: study_log(MATH_REVIEW) 기록 + 다음 문제
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
        title="수학"
        onBack={() => navigate(-1)}
        right={
          <span style={{ fontSize: 15, color: 'var(--color-text-brand)' }}>
            {INDEX} / {TOTAL}
          </span>
        }
      />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: '12px var(--spacing-xl)',
        }}
      >
        {phase === 'thinking' && (
          <>
            <MathProblemCard problem={problem} />
            {problem.diagnosis && <DiagnosisBanner description={problem.diagnosis.description} />}
            <StepAccordion
              steps={problem.steps}
              openSteps={openSteps}
              highlightStep={problem.diagnosis?.failedStep}
              onToggle={toggleStep}
            />
            <p
              style={{
                margin: '4px 0 0',
                textAlign: 'center',
                fontSize: 11,
                color: 'var(--grey-500)',
              }}
            >
              스스로 떠올린 뒤 열어보세요 — 사고의 순서가 곧 풀이예요
            </p>
            <div style={{ marginTop: 'auto', paddingTop: 8 }}>
              <Button block size="lg" onClick={goAnswer}>
                정답 입력하기
              </Button>
            </div>
          </>
        )}

        {phase === 'answer' && (
          <>
            <MathProblemCard problem={problem} slim />
            <AnswerInput value={answer} onChange={setAnswer} />
            <div style={{ marginTop: 'auto', paddingTop: 8 }}>
              <Button
                block
                size="lg"
                onClick={submit}
                disabled={!answer.trim()}
                style={{ opacity: answer.trim() ? 1 : 0.4 }}
              >
                채점하기
              </Button>
            </div>
          </>
        )}

        {phase === 'verdict' && (
          <>
            <MathProblemCard problem={problem} slim />
            <VerdictView
              correct={correct}
              answerValue={problem.answerValue}
              explanation={problem.explanation}
              enteredAnswer={answer}
            />
            <div style={{ marginTop: 'auto', paddingTop: 8 }}>
              <GradeButtons onGrade={handleGrade} />
              <p
                style={{
                  margin: '8px 0 0',
                  textAlign: 'center',
                  fontSize: 11,
                  color: 'var(--grey-500)',
                }}
              >
                선택에 따라 다음 복습일이 정해져요 — 기억이 오래갈수록 멀리
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
