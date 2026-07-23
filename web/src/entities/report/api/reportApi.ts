import { apiGet } from '@/shared/api'
import type { ReportSummary } from '../model/types'

/** 월간 리포트 조회 — GET /api/reports/summary?period=YYYY-MM (F-10/12) */
export function fetchReportSummary(period?: string): Promise<ReportSummary> {
  const q = period ? `?period=${period}` : ''
  return apiGet<ReportSummary>(`/api/reports/summary${q}`)
}
