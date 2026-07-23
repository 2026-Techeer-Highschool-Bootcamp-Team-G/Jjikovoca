import { apiGet, apiPost, apiFetch } from '@/shared/api'
import type { Card, Subject } from '../model/types'

export type FeedSubject = 'ALL' | Subject

interface FeedOptions {
  examId?: number // 특정 시험 범위 카드만 (F-29)
  untagged?: boolean // 시험 미지정 카드만 (F-29)
}

/** 통합 피드 조회 (F-04). 04 §3: GET /api/cards?subject=&examId=&untagged= */
export function fetchCards(subject: FeedSubject = 'ALL', opts: FeedOptions = {}): Promise<Card[]> {
  const params = new URLSearchParams({ subject })
  if (opts.examId != null) params.set('examId', String(opts.examId))
  if (opts.untagged) params.set('untagged', 'true')
  return apiGet<{ cards: Card[] }>(`/api/cards?${params.toString()}`).then((r) => r.cards)
}

/** 카드 시험 태깅(수동, 복수·멱등) — POST /api/cards/{id}/exams (F-29) */
export function tagCardExams(
  cardId: number,
  examIds: number[],
): Promise<{ cardId: number; exams: { id: number; title: string }[] }> {
  return apiPost(`/api/cards/${cardId}/exams`, { examIds })
}

/** 카드 시험 태깅 해제 — DELETE /api/cards/{id}/exams/{examId} (F-29) */
export function untagCardExam(cardId: number, examId: number): Promise<{ cardId: number; examId: number }> {
  return apiFetch(`/api/cards/${cardId}/exams/${examId}`, { method: 'DELETE' })
}
