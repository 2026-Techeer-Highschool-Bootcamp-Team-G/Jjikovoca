/**
 * 학습 판정 3버튼(몰라요 / 헷갈려요 / 알아요). 카드 아래 고정으로 두고 순서와 색을 바꾸지 않는다.
 */
export interface GradeButtonsProps {
  onGrade: (grade: 'DONT_KNOW' | 'CONFUSED' | 'KNOW') => void
}
export declare function GradeButtons(props: GradeButtonsProps): JSX.Element
