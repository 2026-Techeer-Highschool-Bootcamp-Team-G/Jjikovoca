import { apiGet } from '@/shared/api'
import type { Card, Subject } from '../model/types'

export type FeedSubject = 'ALL' | Subject

/** 통합 피드 조회 (F-04). 04 §3: GET /api/cards?subject=ALL|ENGLISH|MATH */
export function fetchCards(subject: FeedSubject = 'ALL'): Promise<Card[]> {
  return apiGet<{ cards: Card[] }>(`/api/cards?subject=${subject}`).then((r) => r.cards)
}
