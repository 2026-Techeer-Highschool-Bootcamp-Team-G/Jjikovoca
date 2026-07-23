import { apiGet } from '@/shared/api'
import type { Me } from '../model/types'

/** 내 정보 조회 — GET /api/me (F-11) */
export function fetchMe(): Promise<Me> {
  return apiGet<Me>('/api/me')
}
