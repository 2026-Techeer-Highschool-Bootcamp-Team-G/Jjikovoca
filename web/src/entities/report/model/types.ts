/** 월간 리포트 (F-10/12) — 무료는 full: null */
export interface ReportSummary {
  period: string // YYYY-MM
  basic: {
    newCards: number
    studyCount: number
    accuracy: { word: number | null; problem: number | null } // 0~1
  }
  full: {
    reasonBreakdown: Record<string, number>
    weakConcepts: string[]
    growth: { memorizedDelta: number | null; message: string }
    graduatedThisMonth: number
  } | null
  grass: { date: string; count: number }[]
}
