export interface TagChipProps {
  /** 태그 이름 — 일반 태그는 '#수능특강' 처럼 # 를 포함해 넘긴다 */
  label: string
  /** exam = 시험 태그(강조, 📅 + D-day) · tag = 사용자 정의 태그 · more = '+2' 말줄임 칩 */
  kind?: 'exam' | 'tag' | 'more'
  /** 시험 태그의 남은 일수 (kind='exam' 일 때만) */
  dday?: number
  active?: boolean
  onClick?: () => void
  /** 넘기면 × 삭제 버튼이 붙는다 (태그 편집 시트) */
  onRemove?: () => void
  size?: 'sm' | 'md'
}
export function TagChip(props: TagChipProps): JSX.Element
