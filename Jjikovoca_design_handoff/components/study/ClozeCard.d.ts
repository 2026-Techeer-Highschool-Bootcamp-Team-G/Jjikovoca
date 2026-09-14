export interface ClozeCardProps {
  /** 빈칸을 '___' 로 표기한 예문 */
  sentence: string
  translation?: string
  value?: string
  onChange?: (value: string) => void
  /** Enter 또는 제출 버튼 */
  onSubmit?: () => void
  /** 서버 판정 결과가 도착해 정답/오답 뜻을 공개하는 상태 */
  judged?: boolean
  correct?: boolean
  /** 정답 단어 */
  word?: string
  /** 단어 뜻 — 판정 화면에서 형광펜으로 공개된다 */
  meaning?: string
  /** 단계 힌트 (첫 글자, 글자 수 등) */
  hint?: string
}
export function ClozeCard(props: ClozeCardProps): JSX.Element
