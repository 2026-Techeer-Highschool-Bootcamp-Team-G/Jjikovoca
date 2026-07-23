import { apiGet } from '@/shared/api'
import type { CardType, Subject } from '../model/types'

/** 원문 보관함 항목 (F-27) — 크롭 원문 썸네일 */
export interface ArchiveItem {
  cardId: number
  type: CardType
  subject: Subject | null
  imageUrl: string
}

export interface ArchiveDay {
  date: string // YYYY-MM-DD
  items: ArchiveItem[]
}

/** 원문 보관함 조회 — GET /api/cards/archive?month=YYYY-MM (F-27, 일자별 그룹) */
export function fetchArchive(month?: string): Promise<ArchiveDay[]> {
  const q = month ? `?month=${month}` : ''
  return apiGet<{ days: ArchiveDay[] }>(`/api/cards/archive${q}`).then((r) => r.days)
}
