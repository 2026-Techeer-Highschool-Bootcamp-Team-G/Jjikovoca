import type { Subject } from '@/entities/card'

/** 시험 (F-19/F-29) — 홈 D-day·마이 시험 일정의 데이터 */
export interface Exam {
  id: number
  title: string
  subject: Subject | null // null = 전과목
  examDate: string // YYYY-MM-DD
  dday: number
  memoryRate?: number | null // 시험범위 기억률 = 태깅 단어들의 FSRS 회상확률 평균(0~1). null=태깅 없음/미복습
}
