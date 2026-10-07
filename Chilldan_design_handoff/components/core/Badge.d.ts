import * as React from 'react'

export type BadgeColor = 'blue' | 'green' | 'red' | 'yellow' | 'grey'
export type BadgeVariant = 'fill' | 'weak'

/** 상태 라벨. 졸업=green, 오답/몰라요=red, 복습예정=yellow, 유형=blue, 과목=grey. */
export interface BadgeProps {
  color?: BadgeColor
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  children: React.ReactNode
}
export declare function Badge(props: BadgeProps): JSX.Element
