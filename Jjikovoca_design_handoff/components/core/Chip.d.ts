import * as React from 'react'

/** 목록 상단 분류 필터 칩. 라벨 뒤에 개수를 붙여 쓴다("전체 24"). */
export interface ChipProps {
  active?: boolean
  onClick?: () => void
  children: React.ReactNode
}
export declare function Chip(props: ChipProps): JSX.Element
