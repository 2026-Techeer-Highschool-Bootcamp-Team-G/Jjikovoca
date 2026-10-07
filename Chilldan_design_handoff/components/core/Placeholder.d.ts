/** 미설계 화면의 자리표시 — 제목(22/700) + 설명. 가짜 데이터로 화면을 채우지 않는다는 앱 원칙의 구현체. */
export interface PlaceholderProps {
  title: string
  note?: string
}
export declare function Placeholder(props: PlaceholderProps): JSX.Element
