export interface TagItem {
  label: string
  kind?: 'exam' | 'tag'
  /** 시험 태그의 남은 일수 */
  dday?: number
}
export interface TagListProps {
  tags?: TagItem[]
  /** 일반 태그 노출 개수 — 초과분은 '+N' 으로 접힌다 (기본 2) */
  max?: number
  size?: 'sm' | 'md'
  align?: 'flex-start' | 'center'
  /** '+N' 칩을 누를 때 (태그 전체 보기) */
  onMore?: () => void
}
export function TagList(props: TagListProps): JSX.Element
