export interface OfflineNoticeProps {
  title?: string
  description?: string
  onRetry?: () => void
  /** screen = 화면 전체 대체 · banner = 상단 한 줄 경고 */
  variant?: 'screen' | 'banner'
}
export function OfflineNotice(props: OfflineNoticeProps): JSX.Element
