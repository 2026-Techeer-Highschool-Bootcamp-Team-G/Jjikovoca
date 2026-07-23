import { apiGet, apiPost } from '@/shared/api'
import type { Card } from '@/entities/card'

// 캡처 분석 — 비동기(202 접수 → 폴링/SSE). 05 §5

interface AnalyzeInput {
  type: 'WORD' | 'PROBLEM'
  cropImages?: string[] // WORD 시 형광펜 크롭 base64(최대 10)
  fullImage?: string // 지문 전체(문맥 뜻 판별)
  cropImage?: string // PROBLEM 시 문제 박스 크롭(단일)
  examId?: number
}

export interface AnalyzeAccepted {
  jobId: string
  status: 'PENDING'
}

export type AnalyzeJobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'

export interface AnalyzeJob {
  status: AnalyzeJobStatus
  cards?: Card[]
  model?: string
  error?: string
}

/** 캡처 분석 접수 — POST /api/cards/analyze (202, quota 차감·job 생성) */
export function analyzeCapture(input: AnalyzeInput): Promise<AnalyzeAccepted> {
  return apiPost<AnalyzeAccepted>('/api/cards/analyze', input)
}

/** 분석 작업 폴링 — GET /api/cards/analyze/{jobId} (2초 간격, COMPLETED면 cards) */
export function pollAnalyzeJob(jobId: string): Promise<AnalyzeJob> {
  return apiGet<AnalyzeJob>(`/api/cards/analyze/${jobId}`)
}
