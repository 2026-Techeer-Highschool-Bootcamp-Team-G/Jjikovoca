// F-26 수학 사고과정 복습 모델

export interface MathStep {
  no: number
  title: string
  question: string
  // 사고 내용 — 단계 공개(클릭) 시에만 표시. 04 §4 비노출 계약상 큐 응답엔 없고 공개 API로 받음.
  content: string
}

export interface MathDiagnosis {
  failedStep: number
  description: string
  // F-18 제안 사유 — 명세 diagnosis.suggestedReason 정합(선택)
  suggestedReason?: 'CONCEPT' | 'MISTAKE' | 'MISREAD' | 'TIME'
}

export interface MathProblem {
  title: string
  tags: { label: string; tone: 'grey' | 'blue' }[]
  wrongCount?: number
  diagnosis?: MathDiagnosis
  steps: MathStep[]
  // answerValue·explanation 은 판정 후에만 공개되는 값 (04 §11-7). NUMERIC=쉼표 복수·순서 무관.
  answerValue: string
  explanation: string
}

export type MathPhase = 'thinking' | 'answer' | 'verdict'
