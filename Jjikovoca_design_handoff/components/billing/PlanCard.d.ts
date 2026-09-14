export interface PlanCardProps {
  name: string
  /** 숫자면 ₩ 를 붙여 천 단위로 찍는다 */
  price: number | string
  period?: string
  /** 일일 AI 분석 한도 — 형광펜으로 강조된다. 예: '사진 분석 하루 20회' */
  quota?: string
  features?: string[]
  /** 현재 이용 중인 플랜 */
  current?: boolean
  recommended?: boolean
  disabled?: boolean
  onSelect?: () => void
  ctaLabel?: string
}
export function PlanCard(props: PlanCardProps): JSX.Element
