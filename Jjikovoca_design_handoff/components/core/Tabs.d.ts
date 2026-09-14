/** 상단 세그먼트 탭 — 균등 분할 + 선택 위치로 슬라이드하는 2px 브랜드 인디케이터. */
export interface TabDef {
  key: string
  label: string
}
export interface TabsProps {
  tabs: TabDef[]
  value: string
  onChange: (key: string) => void
}
export declare function Tabs(props: TabsProps): JSX.Element
