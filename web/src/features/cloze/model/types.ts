// F-06 빈칸 퀴즈 모델.

/** 주관식 문항 (명세 GET /api/study/cloze) — 정답 미포함(치팅 방지) */
export interface ClozeItem {
  cardId: number
  clozeText: string // "... _____ ..." 빈칸(밑줄 여러 개) 포함 문장
  meaning: string
  hints: string[] // 첫 글자·글자 수·뜻 등
}

/** 서버 판정 결과 (명세 POST /api/study/cloze/{id}/answer) — 이 시점에만 정답 공개 */
export interface ClozeJudge {
  correct: boolean
  word: string
  cardId: number
  boxLevel: number
  nextReviewAt: string
  graduated: boolean
}
