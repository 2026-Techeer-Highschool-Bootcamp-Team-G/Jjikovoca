// F-06 빈칸 퀴즈 모델.

/** 주관식 문항 (명세 GET /api/study/cloze) — 정답 미포함(치팅 방지) */
export interface ClozeItem {
  cardId: number
  clozeText: string // "... _ ..." 빈칸 포함 문장
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

// (레거시) 4지선다 데모 — cloze-correct/wrong 화면·폴백에서 사용
export interface ClozeOption {
  word: string
  meaning: string // 판정 후에만 표시 (v1.6 선택지 뜻 — 치팅 방지)
}

export interface ClozeQuestion {
  pre: string // 빈칸 앞 문장
  post: string // 빈칸 뒤 문장
  answer: string // 정답 단어
  translationBlank: string // 문제 번역 (빈칸 표시)
  translationFilled: string // 판정 후 번역 (정답 반영)
  options: ClozeOption[]
  wordPhrase: string // "take charge of — ~을 책임지다, 맡다"
  correctNote: string // 정답 시 부연
  wrongNote: string // 오답 시 부연 (Box 0 이동 등)
}
