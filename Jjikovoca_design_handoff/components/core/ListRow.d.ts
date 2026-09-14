import * as React from 'react'

/**
 * 설정·목록 행(높이 64). 제목 앞 이모지를 문자열에 직접 넣는 용례가 앱에 많다("📅 시험 일정").
 */
export interface ListRowProps {
  /** 좌측 40px 원형 배경 안에 들어가는 아이콘 */
  icon?: React.ReactNode
  title: string
  subtitle?: string
  /** 우측 값 텍스트("D-12", "처리 중…") */
  value?: string
  /** 값 색 오버라이드 — 강조 시 var(--color-brand-primary) */
  valueColor?: string
  onClick?: () => void
  showArrow?: boolean
  divider?: boolean
}
export declare function ListRow(props: ListRowProps): JSX.Element
