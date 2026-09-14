/** 목록 섹션 머리 — 좌측 제목(17/500), 우측 선택적 텍스트 링크(13/brand). */
export interface ListHeaderProps {
  title: string
  /** 우측 링크 라벨. 없으면 링크를 그리지 않는다 */
  link?: string
  onLink?: () => void
}
export declare function ListHeader(props: ListHeaderProps): JSX.Element
