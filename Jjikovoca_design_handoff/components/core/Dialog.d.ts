import * as React from 'react'

/** 중앙 모달 — dim 배경 탭으로 닫힌다. 확인/경고처럼 짧은 결정에만 쓰고, 선택지가 여럿이면 BottomSheet. */
export interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}
export declare function Dialog(props: DialogProps): JSX.Element | null
