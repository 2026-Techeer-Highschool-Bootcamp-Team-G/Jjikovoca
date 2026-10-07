/**
 * 앱 아이콘 세트(24px 그리드, 2px 라인, currentColor). 코드베이스의 개별 Icon* 컴포넌트를 이름 기반 래퍼로 묶은 것.
 */
export type IconName =
  | 'menu' | 'search' | 'bell' | 'clock' | 'calendar' | 'fire' | 'check' | 'refresh' | 'trophy'
  | 'chevron-right' | 'chevron-left' | 'close' | 'speaker' | 'home' | 'book' | 'vocab' | 'chart'
  | 'user' | 'camera'

export interface IconProps {
  name: IconName
  /** 기본 24. 목록 화살표 16, 인라인 18~20, 탭 24 */
  size?: number
  style?: React.CSSProperties
}
export declare function Icon(props: IconProps): JSX.Element
export declare const ICON_NAMES: IconName[]
