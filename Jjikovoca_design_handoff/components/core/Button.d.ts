import * as React from 'react'

/**
 * 기본 액션 버튼. 화면 하단 주 CTA는 size="lg" block.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** fill(파랑) / weak(연파랑) / ghost(테두리) */
  variant?: 'primary' | 'weak' | 'ghost'
  /** md=텍스트 15 / lg=높이 52, 텍스트 17 */
  size?: 'md' | 'lg'
  /** 가로 100% */
  block?: boolean
}
export declare function Button(props: ButtonProps): JSX.Element
