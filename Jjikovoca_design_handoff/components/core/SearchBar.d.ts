/** 검색 진입 바(표시 전용) — 탭하면 검색 화면으로 이동한다. 실제 입력은 검색 화면의 필드가 받는다. */
export interface SearchBarProps {
  placeholder?: string
  onClick?: () => void
}
export declare function SearchBar(props: SearchBarProps): JSX.Element
