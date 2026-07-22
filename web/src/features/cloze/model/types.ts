// F-06 빈칸 퀴즈 모델. 4지선다, 선택 즉시 채점(판정=이력 일체형, 04 §5).

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
