export interface SegmentedOption {
  value: string
  label: string
}
export interface SegmentedControlProps {
  options?: SegmentedOption[]
  value?: string
  onChange?: (value: string) => void
  /** 가로 전체 폭으로 늘린다 (설정 행에서 사용) */
  block?: boolean
  size?: 'sm' | 'md'
}
export function SegmentedControl(props: SegmentedControlProps): JSX.Element
