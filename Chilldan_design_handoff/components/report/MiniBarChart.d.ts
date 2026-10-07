export interface MiniBarDatum {
  /** 요일 등 짧은 라벨 */
  label: string
  value: number
}
export interface MiniBarChartProps {
  data?: MiniBarDatum[]
  height?: number
  /** 값 단위 라벨 (기본 '분') */
  unit?: string
  /** 최댓값 막대를 브랜드 파랑으로 강조 (기본 true) */
  highlightMax?: boolean
}
export function MiniBarChart(props: MiniBarChartProps): JSX.Element
