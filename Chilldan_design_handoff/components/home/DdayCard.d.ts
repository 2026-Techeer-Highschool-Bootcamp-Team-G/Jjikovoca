/**
 * 홈 최상단 시험 D-day 카드. D-day 배지 색이 남은 일수에 따라 초록→연두→주황→빨강으로 바뀐다.
 */
export interface DdayCardProps {
  title: string
  /** 남은 일수. 15 이하면 빨강 */
  dday: number
  /** 시험범위 기억률(%) — 값이 없으면 표시하지 않는다 */
  memoryRate?: number
  /** 오늘 복습 개수 */
  todayDue?: number
  /** 직접 지정하는 부제. 주면 memoryRate·todayDue 조합을 덮어쓴다 */
  subtitle?: string
  onClick?: () => void
}
export declare function DdayCard(props: DdayCardProps): JSX.Element
