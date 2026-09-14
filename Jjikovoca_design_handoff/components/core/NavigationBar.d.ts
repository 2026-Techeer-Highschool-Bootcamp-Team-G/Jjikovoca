import * as React from 'react'

/** 하위 화면 상단 바(56px) — 뒤로가기 + 가운데 타이틀 + 우측 액션. 탭 루트 화면은 이 바 대신 22px 페이지 제목을 쓴다. */
export interface NavigationBarProps {
  title: string
  right?: React.ReactNode
  onBack?: () => void
}
export declare function NavigationBar(props: NavigationBarProps): JSX.Element
