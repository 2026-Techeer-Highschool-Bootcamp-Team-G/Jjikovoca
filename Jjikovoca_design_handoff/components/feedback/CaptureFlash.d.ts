/** 촬영 성공 순간의 즉시 보상 이펙트 — 화이트 플래시 + 노란 스파클 버스트 + 상승하는 XP 칩. */
export interface CaptureFlashProps {
  /** true 인 동안 재생. 재생 후 부모가 false 로 내린다 */
  active: boolean
  /** XP 칩 문구(기본 "⚡ +5 XP") */
  xpLabel?: string
}
export declare function CaptureFlash(props: CaptureFlashProps): JSX.Element | null
