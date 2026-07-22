import { useState } from 'react'
import type { MathPhase, MathProblem } from './types'

// NUMERIC 정답 정규화 — 쉼표 분리·공백 무시·순서 무관 숫자 집합 비교 (04 §4, v2.0)
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

export function useMathReview(problem: MathProblem) {
  const [phase, setPhase] = useState<MathPhase>('thinking')
  const [openSteps, setOpenSteps] = useState<Set<number>>(new Set())
  const [answer, setAnswer] = useState('')
  const [correct, setCorrect] = useState(false)

  const toggleStep = (no: number) =>
    setOpenSteps((prev) => {
      const next = new Set(prev)
      if (next.has(no)) next.delete(no)
      else next.add(no)
      return next
    })

  const goAnswer = () => setPhase('answer')

  const submit = () => {
    setCorrect(normalize(answer) === normalize(problem.answerValue))
    setPhase('verdict')
  }

  return { phase, openSteps, toggleStep, answer, setAnswer, correct, goAnswer, submit }
}
