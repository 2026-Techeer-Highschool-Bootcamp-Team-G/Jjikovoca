import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { NavigationBar, Button } from '@/shared/ui'
import {
  MathProblemCard,
  DiagnosisBanner,
  StepAccordion,
  AnswerInput,
  VerdictView,
  fetchMathQueue,
  revealStep,
  judgeMath,
} from '@/features/math-review'
import type { MathProblem, MathStep, MathPhase, MathJudge } from '@/features/math-review'
import { recordStudy } from '@/features/study'
import { GradeButtons } from '@/features/study-grade'
import type { Grade } from '@/features/study-grade'

// NUMERIC 정답 정규화 — 쉼표 분리·공백 무시·순서 무관 숫자 집합 비교 (폴백 로컬 판정)
function normalize(input: string): string {
  return input
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b)
    .join(',')
}

// 백엔드 연결 전 데모 (프로토타입 12 수학 복습과 동일)
const demo: MathProblem = {
  title: 'x² − 5x + 6 = 0 의 두 근을 구하시오.',
  tags: [
    { label: '수학', tone: 'grey' },
    { label: '이차방정식 · 인수분해', tone: 'blue' },
  ],
  wrongCount: 2,
  diagnosis: { failedStep: 3, description: '3단계 이항에서 부호 실수가 있었어요. 이 단계 주의!' },
  steps: [
    { no: 1, title: '무엇을 구하는 문제인가요?', question: '무엇을 구하는 문제인가요?', content: 'x² − 5x + 6 = 0을 만족하는 x, 즉 이차방정식의 두 근을 구하는 문제예요.' },
    { no: 2, title: '어떤 개념을 적용할까요?', question: '어떤 개념을 적용할까요?', content: '좌변을 (x−a)(x−b) 꼴로 바꾸는 인수분해 — 곱해서 6, 더해서 −5가 되는 두 수를 찾아요.' },
    { no: 3, title: '이항할 때 부호는 어떻게 될까요?', question: '이항할 때 부호는 어떻게 될까요?', content: '이항 없이 그대로 인수분해하면 (x−2)(x−3) = 0. 지난번엔 여기서 부호가 뒤집혔어요.' },
    { no: 4, title: '구한 근을 검산해 볼까요?', question: '구한 근을 검산해 볼까요?', content: 'x = 2, 3을 원식에 대입하면 좌변이 둘 다 0 — 근이 맞아요.' },
  ],
  answerValue: '2, 3',
  explanation:
    '곱해서 6, 더해서 −5가 되는 두 수는 −2와 −3. 따라서 (x−2)(x−3) = 0 → x = 2 또는 x = 3이에요. 이항할 땐 부호가 바뀐다는 것만 기억하면 완벽!',
}

/** 수학 사고과정 복습 (F-26) — 큐 → 단계 공개 → 판정 → 기록 */
export function MathReviewPage() {
  const navigate = useNavigate()

  // 실 큐 조회 — 미가동 시 데모 폴백
  const queue = useQuery({ queryKey: ['math'], queryFn: () => fetchMathQueue(), retry: 0 })
  const card = queue.data?.[0] ?? null
  const cardId = card?.cardId ?? -1
  const total = queue.data?.length ?? 8

  const [phase, setPhase] = useState<MathPhase>('thinking')
  const [openSteps, setOpenSteps] = useState<Set<number>>(new Set())
  const [answer, setAnswer] = useState('')
  const [revealed, setRevealed] = useState<Record<number, string>>({})
  const [judge, setJudge] = useState<MathJudge | null>(null)
  const [correct, setCorrect] = useState(false)
  const clickedRef = useRef<number[]>([]) // 회상(정답 입력) 전 연 단계 로그

  // 표시용 문제 — 실 카드 or 데모. 실 카드의 단계 content 는 공개 API로 채운다(비노출 계약)
  const steps: MathStep[] = card
    ? (card.solutions[0]?.steps ?? []).map((s) => ({
        no: s.no,
        title: s.title,
        question: s.question,
        content: revealed[s.no] ?? '',
      }))
    : demo.steps
  const view: MathProblem = card
    ? {
        title: card.latex,
        tags: [{ label: '수학', tone: 'grey' }],
        diagnosis: card.diagnosis,
        steps,
        answerValue: '',
        explanation: '',
      }
    : demo

  const revealMut = useMutation({
    mutationFn: (no: number) => revealStep(cardId, no),
    onSuccess: (r) => setRevealed((m) => ({ ...m, [r.no]: r.content })),
  })

  const toggleStep = (no: number) =>
    setOpenSteps((prev) => {
      const next = new Set(prev)
      if (next.has(no)) {
        next.delete(no)
      } else {
        next.add(no)
        if (phase === 'thinking' && !clickedRef.current.includes(no)) clickedRef.current.push(no)
        if (card && revealed[no] === undefined) revealMut.mutate(no) // 실 카드면 단계 content 공개
      }
      return next
    })

  const judgeMut = useMutation({
    mutationFn: (): Promise<MathJudge> => {
      const a = answer.trim()
      if (card) return judgeMath(cardId, a) // 서버 판정
      const ok = normalize(a) === normalize(demo.answerValue) // 폴백 로컬 판정
      return Promise.resolve({
        correct: ok,
        answerValue: demo.answerValue,
        solutions: [{ index: 0, label: '', explanation: demo.explanation }],
      })
    },
    onSuccess: (r) => {
      setJudge(r)
      setCorrect(r.correct)
      setPhase('verdict')
    },
  })

  const handleGrade = (grade: Grade) => {
    // MATH_REVIEW 기록(클릭로그) — 실 카드만. 백엔드 없으면 조용히 실패
    if (cardId >= 0) {
      recordStudy(cardId, {
        activity: 'MATH_REVIEW',
        result: grade,
        detail: { stepsTotal: steps.length, clickedBeforeRecall: clickedRef.current, answerCorrect: correct },
      }).catch(() => {})
    }
    navigate(-1)
  }

  const answerValue = judge?.answerValue ?? demo.answerValue
  const explanation = judge?.solutions[0]?.explanation ?? demo.explanation

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-secondary)' }}>
      <NavigationBar
        title="수학"
        onBack={() => navigate(-1)}
        right={<span style={{ fontSize: 15, color: 'var(--color-text-brand)' }}>1 / {total}</span>}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: '12px var(--spacing-xl)' }}>
        {phase === 'thinking' && (
          <>
            <MathProblemCard problem={view} />
            {view.diagnosis && <DiagnosisBanner description={view.diagnosis.description} />}
            <StepAccordion
              steps={view.steps}
              openSteps={openSteps}
              highlightStep={view.diagnosis?.failedStep}
              onToggle={toggleStep}
            />
            <p style={{ margin: '4px 0 0', textAlign: 'center', fontSize: 11, color: 'var(--grey-500)' }}>
              스스로 떠올린 뒤 열어보세요 — 사고의 순서가 곧 풀이예요
            </p>
            <div style={{ marginTop: 'auto', paddingTop: 8 }}>
              <Button block size="lg" onClick={() => setPhase('answer')}>
                정답 입력하기
              </Button>
            </div>
          </>
        )}

        {phase === 'answer' && (
          <>
            <MathProblemCard problem={view} slim />
            <AnswerInput value={answer} onChange={setAnswer} />
            <div style={{ marginTop: 'auto', paddingTop: 8 }}>
              <Button
                block
                size="lg"
                onClick={() => judgeMut.mutate()}
                disabled={!answer.trim() || judgeMut.isPending}
                style={{ opacity: answer.trim() ? 1 : 0.4 }}
              >
                {judgeMut.isPending ? '채점 중…' : '채점하기'}
              </Button>
            </div>
          </>
        )}

        {phase === 'verdict' && (
          <>
            <MathProblemCard problem={view} slim />
            <VerdictView correct={correct} answerValue={answerValue} explanation={explanation} enteredAnswer={answer} />
            <div style={{ marginTop: 'auto', paddingTop: 8 }}>
              <GradeButtons onGrade={handleGrade} />
              <p style={{ margin: '8px 0 0', textAlign: 'center', fontSize: 11, color: 'var(--grey-500)' }}>
                선택에 따라 다음 복습일이 정해져요 — 기억이 오래갈수록 멀리
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
