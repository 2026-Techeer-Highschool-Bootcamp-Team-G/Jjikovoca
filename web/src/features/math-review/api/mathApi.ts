import { apiGet, apiPost } from '@/shared/api'
import type { ReasonTag } from '@/entities/card'

// F-26 수학 복습 — 비노출 계약: 단계 content·정답·해설은 공개/판정 API 응답에만 존재

export interface MathStepMeta {
  no: number
  title: string
  question: string
}

export interface MathSolutionMeta {
  index: number
  label: string
  steps: MathStepMeta[]
}

export interface MathDiagnosisFull {
  failedStep: number
  description: string
  suggestedReason?: ReasonTag
}

/** 큐 카드 (content·정답 미포함) */
export interface MathQueueCard {
  cardId: number
  latex: string
  imagePath?: string
  solutions: MathSolutionMeta[]
  diagnosis?: MathDiagnosisFull
}

export interface RevealedStep {
  solutionIndex: number
  no: number
  content: string
}

export interface MathSolutionExplained {
  index: number
  label: string
  explanation: string
}

/** 판정 결과 (정답·해설은 이 응답에만) */
export interface MathJudge {
  correct: boolean
  answerValue: string
  solutions: MathSolutionExplained[]
  diagnosis?: MathDiagnosisFull
}

/** 수학 복습 큐 — GET /api/study/math (content·정답 미포함) */
export function fetchMathQueue(limit = 10): Promise<MathQueueCard[]> {
  return apiGet<{ cards: MathQueueCard[] }>(`/api/study/math?limit=${limit}`).then((r) => r.cards)
}

/** 사고 단계 공개 — POST /api/study/math/{cardId}/steps/{no} (이때만 content, 클릭로그 근거) */
export function revealStep(cardId: number, no: number, solutionIndex = 0): Promise<RevealedStep> {
  return apiPost<RevealedStep>(`/api/study/math/${cardId}/steps/${no}?solutionIndex=${solutionIndex}`)
}

/** 수학 정답 판정 — POST /api/study/math/{cardId}/answer (판정 후에만 정답·해설 공개) */
export function judgeMath(cardId: number, answer: string, durationMs?: number): Promise<MathJudge> {
  return apiPost<MathJudge>(`/api/study/math/${cardId}/answer`, { answer, durationMs })
}

/** 다른 풀이 생성 — POST /api/study/math/{cardId}/solutions (프리미엄, card.solutions[]에 append) */
export function generateSolution(cardId: number): Promise<MathSolutionMeta> {
  return apiPost<MathSolutionMeta>(`/api/study/math/${cardId}/solutions`)
}
