/** 경험치 현황 (F-11) — 게임형 홈 데이터 소스 */
export interface ExpSummary {
  level: number
  exp: number
  nextLevelExp: number
  todayEarned: number
  dailyCap: number
  streakDays: number
}

/** 출석 체크 결과 (일 1회 멱등) */
export interface AttendResult {
  earned: number
  total: number
  levelUp: boolean
  streakDays: number
}
