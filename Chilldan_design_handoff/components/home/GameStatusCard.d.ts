/**
 * 레벨·XP·연속일 + 일일 퀘스트 한 행. XP 바만 옐로우 그라데이션(보상)을 쓰고 나머지는 브랜드 파랑.
 */
export interface GameStatusCardProps {
  level: number
  /** 레벨 호칭("단어 헌터") */
  heroTitle: string
  exp: number
  nextExp: number
  /** 연속 학습일. 14일 이상이면 불꽃에 글로우가 붙는다 */
  streakDays: number
  /** 퀘스트 한 줄 문구 — 진행도와 보상을 함께 적는다 */
  questLabel: string
  onQuestClick?: () => void
}
export declare function GameStatusCard(props: GameStatusCardProps): JSX.Element
