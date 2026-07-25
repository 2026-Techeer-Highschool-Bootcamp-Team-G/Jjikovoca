// 플래시카드 표시 데이터 (F-05). 크롭 원문은 미노출(v1.2) — 앞면은 AI 연상 이미지.
export interface FlashcardData {
  cardId: number
  word: string
  pronunciation: string
  conceptEmoji: string
  mnemonicPath: string | null // AI 연상 이미지 파일명(미생성 시 null → 생성 버튼)
  pos: string
  meaning: string
  dictNote: string
  frontTags: { label: string; tone: 'grey' | 'blue' }[]
  backTags: { label: string; tone: 'blue' | 'red' }[]
  example: { pre: string; highlight: string; post: string; translation: string }
}
