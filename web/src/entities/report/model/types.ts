export type ReportSubject = 'ENGLISH' | 'MATH'

/** 월간 리포트 (F-10/12) — 무료는 full: null */
export interface ReportSummary {
  period: string // YYYY-MM
  basic: {
    newCards: number
    studyCount: number
    accuracy: { word: number | null; problem: number | null } // 0~1
    /** 과목별 학습 비중(분 내림차순, ratio 0~1) */
    subjectBreakdown: { subject: ReportSubject; minutes: number; count: number; ratio: number }[]
    /** 학습 리듬 — 오늘 학습 분·평균 세션 분 */
    rhythm: { todayStudyMinutes: number; avgSessionMinutes: number }
    /** 오늘 복습 대기 수 */
    todayDue: number
  }
  full: {
    reasonBreakdown: Record<string, number>
    /** 약한 개념(과목별·오답 횟수) — 프리미엄 전용 */
    weakConcepts: { concept: string; subject: ReportSubject; wrongCount: number }[]
    growth: { memorizedDelta: number | null; message: string }
    graduatedThisMonth: number
  } | null
  /** 학습 잔디 — level 0~4(색 강도), minutes 일별 학습 분 */
  grass: { date: string; count: number; minutes: number; level: number }[]
}
