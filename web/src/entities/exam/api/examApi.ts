import { apiGet } from '@/shared/api'
import type { Exam } from '../model/types'

/** 내 시험 목록(다가오는 순) — GET /api/exams (F-19) */
export function fetchExams(): Promise<Exam[]> {
  return apiGet<{ exams: Exam[] }>('/api/exams').then((r) => r.exams)
}
