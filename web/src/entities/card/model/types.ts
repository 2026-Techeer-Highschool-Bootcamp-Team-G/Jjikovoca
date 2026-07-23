export type CardType = 'WORD' | 'PROBLEM'
export type Subject = 'ENGLISH' | 'MATH'
export type ReasonTag = 'CONCEPT' | 'MISTAKE' | 'MISREAD' | 'TIME'

/**
 * 사고 단계 메타 (F-26). content(사고 내용)는 단계 공개 응답에만 존재하므로
 * 이 타입에 포함하지 않는다 — 문서 04 §11-7 / 12 §5-3 비노출 계약.
 */
export interface SolutionStepMeta {
  no: number
  title: string
  question: string
}

/** F-18 풀이 흔적 진단 (필기 없으면 null) */
export interface Diagnosis {
  failedStep: number
  description: string
  suggestedReason: ReasonTag
}

/**
 * 카드 모델 (단어·문제 통합, STI). 04 §3 분석/조회 응답 계약.
 * ⚠️ answerValue · explanation · 단계 content 는 이 타입에 절대 두지 않는다
 *    (서버가 판정 응답에만 주는 값 — features/math-review 의 JudgeResult 로 분리).
 */
export interface Card {
  id: number
  type: CardType
  subject: Subject | null
  concept?: string | null
  imagePath?: string | null
  boxLevel: number
  graduated: boolean
  createdAt: string
  /** 태깅된 시험(행 시험 칩, F-29) */
  exams?: { id: number; title: string }[]

  // WORD
  word?: string
  contextMeaning?: string
  dictMeaning?: string
  example?: string

  // PROBLEM
  summary?: string
  latex?: string
  hint1?: string | null
  hint2?: string | null
  hint3?: string | null
  hintsLocked?: boolean
  solutionSteps?: SolutionStepMeta[]
  diagnosis?: Diagnosis | null
}
