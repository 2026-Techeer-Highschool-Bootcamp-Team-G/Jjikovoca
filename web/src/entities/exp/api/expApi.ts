import { apiGet, apiPost } from '@/shared/api'
import type { AttendResult, ExpSummary } from '../model/types'

/** 레벨·경험치·연속 학습일 — GET /api/exp/summary (F-11) */
export function fetchExpSummary(): Promise<ExpSummary> {
  return apiGet<ExpSummary>('/api/exp/summary')
}

/** 출석 체크 — POST /api/exp/attend (일 1회 멱등, 재호출 시 earned:0) */
export function attend(): Promise<AttendResult> {
  return apiPost<AttendResult>('/api/exp/attend')
}
