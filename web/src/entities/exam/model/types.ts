import type { Subject } from '@/entities/card'

/** 시험 (F-19/F-29) — 홈 D-day·마이 시험 일정의 데이터 */
export interface Exam {
  id: number
  title: string
  subject: Subject | null // null = 전과목
  examDate: string // YYYY-MM-DD
  dday: number
}
