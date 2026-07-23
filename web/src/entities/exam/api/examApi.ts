import { apiGet, apiFetch, apiPost } from '@/shared/api'
import type { Exam } from '../model/types'
import type { Subject } from '@/entities/card'

/** 내 시험 목록(다가오는 순) — GET /api/exams (F-19) */
export function fetchExams(): Promise<Exam[]> {
  return apiGet<{ exams: Exam[] }>('/api/exams').then((r) => r.exams)
}

export interface ExamInput {
  title: string
  subject: Subject | null
  examDate: string // YYYY-MM-DD
}

/** 시험 등록 — POST /api/exams (등록 시 서버가 복습 일정 역산 재배치) */
export function createExam(input: ExamInput): Promise<Exam & { rescheduledCount: number }> {
  return apiPost<Exam & { rescheduledCount: number }>('/api/exams', input)
}

/** 시험 수정 — PATCH /api/exams/{id} (날짜 변경 시 역산 재배치) */
export function updateExam(id: number, patch: Partial<ExamInput>): Promise<Exam & { rescheduledCount: number }> {
  return apiFetch<Exam & { rescheduledCount: number }>(`/api/exams/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

/** 시험 삭제 — DELETE /api/exams/{id} */
export function deleteExam(id: number): Promise<{ deletedId: number; rescheduledCount: number }> {
  return apiFetch<{ deletedId: number; rescheduledCount: number }>(`/api/exams/${id}`, { method: 'DELETE' })
}

/** 최근 카드 일괄 태깅(넛지) — POST /api/exams/{id}/tag-recent */
export function tagRecentCards(id: number, sinceDays = 14): Promise<{ examId: number; taggedCount: number }> {
  return apiPost<{ examId: number; taggedCount: number }>(`/api/exams/${id}/tag-recent`, { sinceDays })
}
