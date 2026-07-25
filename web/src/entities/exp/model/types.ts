/** 경험치 현황 (F-11) — 게임형 홈 데이터 소스 */
export interface ExpSummary {
  level: number
  exp: number
  nextLevelExp: number
  todayEarned: number
  dailyCap: number
  streakDays: number
  /** 일일 퀘스트 — progress(오늘 학습 수)/target(학습수+복습대기), completed(복습대기 0) */
  quest?: { label: string; progress: number; target: number; completed: boolean }
}

/** 출석 체크 결과 (일 1회 멱등) */
export interface AttendResult {
  earned: number
  total: number
  levelUp: boolean
  streakDays: number
}
