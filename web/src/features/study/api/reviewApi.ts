import { apiGet } from '@/shared/api'

/** 오늘 복습 큐 항목 (next_review_at 도래·미졸업) */
export interface ReviewQueueCard {
  id: number
  word?: string
  boxLevel: number
  nextReviewAt: string
}

export interface ReviewQueue {
  dueCount: number
  cards: ReviewQueueCard[]
}

/** 오늘의 복습 큐 — GET /api/study/review-queue (F-13, 홈 배너) */
export function fetchReviewQueue(limit = 50): Promise<ReviewQueue> {
  return apiGet<ReviewQueue>(`/api/study/review-queue?limit=${limit}`)
}
