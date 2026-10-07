export interface DonutSegment {
  label: string
  value: number
  /** CSS 색 — 토큰 var() 를 넘긴다 */
  color?: string
}
export interface DonutChartProps {
  segments?: DonutSegment[]
  size?: number
  thickness?: number
  /** 가운데 큰 숫자 — '78%' 처럼 단위까지 포함한 문자열도 가능 */
  centerValue?: string | number
  centerLabel?: string
}
export function DonutChart(props: DonutChartProps): JSX.Element
