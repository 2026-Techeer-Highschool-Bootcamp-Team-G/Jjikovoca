/** 홈 최근 카드(플립 없는 단면). 정답/오답 결과가 있으면 좌측 4px accent + 배지가 붙는다. */
export interface WordCardProps {
  card: { word?: string }
  /** 최근 학습 결과 */
  result?: 'CORRECT' | 'WRONG'
  pronunciation?: string
  /** 이미지가 없을 때의 개념 이모지 */
  conceptEmoji?: string
  tags?: { label: string; kind?: 'tag' | 'exam'; dday?: number }[]
  onSpeak?: (locale?: 'US' | 'UK') => void
  onClick?: () => void
}
export declare function WordCard(props: WordCardProps): JSX.Element
