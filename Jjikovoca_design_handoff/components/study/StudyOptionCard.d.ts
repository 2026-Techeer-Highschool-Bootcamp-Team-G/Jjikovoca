export interface StudyOptionCardProps {
  /** 왼쪽 뱃지에 넣을 이모지 (icon 이 없을 때) */
  emoji?: string
  /** Icon 세트의 글리프 이름 — emoji 보다 우선 */
  icon?: string
  title: string
  description?: string
  /** 오른쪽 보조 수치 — '단어 14개' 처럼 */
  meta?: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
}
export function StudyOptionCard(props: StudyOptionCardProps): JSX.Element
