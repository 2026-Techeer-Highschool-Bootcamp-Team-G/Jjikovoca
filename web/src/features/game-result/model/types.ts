import type { Grade } from '@/features/study-grade'

// 게임 엔딩(결과 종합) 세션 데이터 — 게임 페이지가 navigate state 로 엔딩 페이지에 넘긴다.
export type GameType = 'FLASHCARD' | 'CLOZE'

/** 한 카드/문제의 결과. 빈칸은 힌트 사용 여부로 grade 를 도출(무힌트 정답=KNOW/힌트 정답=CONFUSED/오답=DONT_KNOW) */
export interface GameResultItem {
  cardId: number
  grade: Grade // 'KNOW' | 'CONFUSED' | 'DONT_KNOW'
  earnedXp: number // 없으면 0
  correct?: boolean // 빈칸만 채움(맞춘/틀린 통계용)
}

export interface GameResultState {
  type: GameType
  items: GameResultItem[]
  totalXp: number // earnedXp 합
  levelUp: boolean // 세션 중 1회라도 레벨업
}
