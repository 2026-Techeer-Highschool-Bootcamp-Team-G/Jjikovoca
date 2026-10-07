/** 학습 진입 로딩 — 브랜드 스피너 + 랜덤 동기부여 명언 + "학습을 준비하고 있어요…". */
export interface StudyLoadingProps {
  /** 명언 고정(미지정 시 내장 5문장 중 랜덤) */
  quote?: string
}
export declare function StudyLoading(props: StudyLoadingProps): JSX.Element
