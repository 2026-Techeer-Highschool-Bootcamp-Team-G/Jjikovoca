export interface TagFilterItem {
  /** 선택 비교용 키 — 없으면 label 을 쓴다 */
  key?: string
  label: string
  kind?: 'exam' | 'tag'
  /** 시험 태그 D-day */
  dday?: number
  /** 라벨 뒤에 붙는 단어 수 */
  count?: number
}
export interface TagFilterTabsProps {
  items?: TagFilterItem[]
  active?: string
  onSelect?: (key: string) => void
  /** '태그 관리' 점선 버튼을 붙인다 */
  onManage?: () => void
}
export function TagFilterTabs(props: TagFilterTabsProps): JSX.Element
