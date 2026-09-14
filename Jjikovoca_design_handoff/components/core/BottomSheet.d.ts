import * as React from 'react'

/** 하단 시트 — 학습 방식 선택, 촬영 방법 선택처럼 옵션이 여러 개인 결정에 쓴다. dim 탭으로 닫힘. */
export interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}
export declare function BottomSheet(props: BottomSheetProps): JSX.Element | null
