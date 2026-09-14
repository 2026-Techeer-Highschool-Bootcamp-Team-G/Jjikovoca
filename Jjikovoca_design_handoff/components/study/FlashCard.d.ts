/**
 * 단어 플래시카드 — 탭하면 3D 플립(0.5s). 앞면은 단어 + AI 연상 이미지, 뒷면은 형광펜 뜻 + 예문 (FR-05).
 * 사용자가 찍은 원본 크롭은 어떤 면에도 노출하지 않는다(v1.2 · 이미지 단기 보관 정합).
 */
export interface FlashCardModel {
  word: string
  pronunciation?: string
  /** AI 연상 이미지. 없으면 emoji 폴백 */
  imageUrl?: string | null
  emoji?: string
  tags?: { label: string; kind?: 'tag' | 'exam'; dday?: number }[]
  /** 영어 예문 */
  example?: string
  /** 예문 한글 해석 */
  exampleTranslation?: string
  /** 뜻 — 뒷면에서 형광펜 강조로 표시 */
  meaning?: string
  pos?: string
}
export interface FlashCardProps {
  card: FlashCardModel
  /** 카드 높이(기본 500) */
  height?: number
  /** 지정 시 controlled — 게임에서 다음 카드로 넘어갈 때 리셋용 */
  flipped?: boolean
  onFlip?: () => void
}
export declare function FlashCard(props: FlashCardProps): JSX.Element
