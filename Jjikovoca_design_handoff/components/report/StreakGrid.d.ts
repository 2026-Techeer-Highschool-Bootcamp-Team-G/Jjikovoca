export interface StreakGridProps {
  /** 일별 학습 강도 0~4 배열 (오래된 날 → 최근 날). weeks*7 보다 짧으면 앞을 0 으로 채운다 */
  days?: number[]
  /** 표시할 주 수 (기본 13주) */
  weeks?: number
  /** 상단에 '🔥 연속 N일' 을 붙인다 */
  streakDays?: number
  cell?: number
  gap?: number
  showLegend?: boolean
}
export function StreakGrid(props: StreakGridProps): JSX.Element
