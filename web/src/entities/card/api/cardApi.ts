import { apiGet } from '@/shared/api'
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
