// F-06 빈칸 퀴즈 모델.

/** 주관식 문항 (명세 GET /api/study/cloze) — 정답 미포함(치팅 방지) */
export interface ClozeItem {
  cardId: number
  clozeText: string // "... _____ ..." 빈칸(밑줄 여러 개) 포함 문장
  meaning: string // 숙어/단어 뜻
  exampleMeaning?: string | null // 예문 전체 한글 번역(신규 카드만, 기존 카드 null → 화면 숨김)
  hints: string[] // [첫 글자, "N글자", 뜻]
}

/** 답안 획득 경험치 — POST /api/study/cloze/{id}/answer 응답(정답 시 base+comboBonus, 오답 0) */
export interface ClozeExp {
  base: number
  comboBonus: number
  earned: number // base + comboBonus
  total: number
  levelUp: boolean
}

/** 서버 판정 결과 (명세 POST /api/study/cloze/{id}/answer) — 이 시점에만 정답 공개 */
export interface ClozeJudge {
  correct: boolean
  word: string // 정답 단어(숙어 포함, 예: "take charge of")
  cardId: number
  boxLevel: number // 오답 시 0(리셋)
  nextReviewAt: string
  graduated: boolean
  meaning?: string // 해설 — 숙어 사전 뜻("~을 책임지다, 맡다")
  exampleMeaning?: string | null // 해설 — 예문 속 쓰임("프로젝트를 맡아")
  combo?: number // 현재 연속 정답 수(백엔드 파생, 오답이면 0)
  exp?: ClozeExp // 획득 경험치(백엔드 미배포 시 undefined)
}
