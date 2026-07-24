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

/** 수학 사고과정 복습 (F-26) — 큐 → 단계 공개 → 서버 판정 → 기록. 정답·단계 content 는 서버만 보유 */
export function MathReviewPage() {
  const navigate = useNavigate()

  // 실 큐 조회 — 단계 content·정답은 비노출(공개/판정 API 로만). 클라에 정답 미내장
  const queue = useQuery({ queryKey: ['math'], queryFn: () => fetchMathQueue() })
  const card = queue.data?.[0] ?? null
  const total = queue.data?.length ?? 1

  const [phase, setPhase] = useState<MathPhase>('thinking')
  const [openSteps, setOpenSteps] = useState<Set<number>>(new Set())
  const [answer, setAnswer] = useState('')
  const [revealed, setRevealed] = useState<Record<number, string>>({})
  const [judge, setJudge] = useState<MathJudge | null>(null)
  const [correct, setCorrect] = useState(false)
  const clickedRef = useRef<number[]>([]) // 회상(정답 입력) 전 연 단계 로그

  const revealMut = useMutation({
    mutationFn: (no: number) => revealStep(card!.cardId, no),
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
        if (revealed[no] === undefined) revealMut.mutate(no) // 단계 content 는 공개 API 로만
      }
      return next
    })

  const judgeMut = useMutation({
    mutationFn: (): Promise<MathJudge> => judgeMath(card!.cardId, answer.trim()),
    onSuccess: (r) => {
      setJudge(r)
      setCorrect(r.correct)
      setPhase('verdict')
    },
  })

  const handleGrade = (grade: Grade) => {
    if (card) {
      recordStudy(card.cardId, {
        activity: 'MATH_REVIEW',
        result: grade,
        detail: { stepsTotal: card.solutions[0]?.steps.length ?? 0, clickedBeforeRecall: clickedRef.current, answerCorrect: correct },
      }).catch(() => {})
    }
    navigate(-1)
  }

  // 풀 문제가 없으면(빈 큐) 데모 대신 빈 상태
  if (!card) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-secondary)' }}>
        <NavigationBar title="수학" onBack={() => navigate(-1)} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--color-text-tertiary)' }}>
            {queue.isLoading ? '문제를 불러오는 중…' : '복습할 수학 문제가 없어요 — 문제를 먼저 촬영해보세요'}
          </p>
        </div>
      </div>
    )
  }

  // 표시용 문제 — 단계 content 는 공개 API 응답(revealed)으로 채운다(비노출 계약)
  const steps: MathStep[] = (card.solutions[0]?.steps ?? []).map((s) => ({
    no: s.no,
    title: s.title,
    question: s.question,
    content: revealed[s.no] ?? '',
  }))
  const view: MathProblem = {
    title: card.latex,
    tags: [{ label: '수학', tone: 'grey' }],
    diagnosis: card.diagnosis,
    steps,
    answerValue: '',
    explanation: '',
  }
  const answerValue = judge?.answerValue ?? ''
  const explanation = judge?.solutions[0]?.explanation ?? ''

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
