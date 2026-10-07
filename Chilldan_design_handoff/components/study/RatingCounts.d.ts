export interface RatingCountsProps {
  /** 알아요 누적 (knowCount) */
  know?: number
  /** 헷갈려요 누적 (confusedCount) */
  confused?: number
  /** 몰라요 누적 (dontKnowCount) */
  dontKnow?: number
  size?: 'sm' | 'md'
  /** 0 인 항목도 표시할지 (기본 true) */
  showZero?: boolean
}
export function RatingCounts(props: RatingCountsProps): JSX.Element
