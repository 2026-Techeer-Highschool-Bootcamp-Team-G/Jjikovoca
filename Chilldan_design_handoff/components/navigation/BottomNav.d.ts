/**
 * 하단 탭 바 — 홈·단어장 / 리포트·마이 4탭 + 중앙에 돌출된 촬영 FAB(앱 로고). FAB 에는 라벨을 달지 않는다.
 */
export interface BottomNavProps {
  active?: 'home' | 'vocab' | 'report' | 'my'
  onSelect?: (key: 'home' | 'vocab' | 'report' | 'my') => void
  /** 중앙 FAB — 촬영 화면 진입 */
  onCapture?: () => void
}
export declare function BottomNav(props: BottomNavProps): JSX.Element
