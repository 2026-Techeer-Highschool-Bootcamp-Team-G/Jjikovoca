import { apiGet, apiPost } from '@/shared/api'
import type { ReasonTag } from '@/entities/card'

// 학습 활동/결과 (명세 §학습) — 모든 복습 활동의 단일 기록 진입점
export type StudyActivity = 'RETRY' | 'FLASHCARD' | 'CLOZE' | 'MATH_REVIEW'
export type StudyResult = 'KNOW' | 'CONFUSED' | 'DONT_KNOW'

/** 플래시카드 큐 항목 (미졸업 WORD) */
export interface FlashcardQueueCard {
  id: number
  word?: string
  contextMeaning?: string
  example?: string
  boxLevel: number
  // 표기용 부가 필드(기존 카드는 null — 하위호환)
  pronunciation?: string | null
  pos?: string | null
  tags?: string[] | null
  emoji?: string | null
  mnemonicImagePath?: string | null // AI 연상 이미지(미생성 시 null → 온디맨드 생성)
}

interface FlashcardQueue {
  total: number
  cards: FlashcardQueueCard[]
}

interface FlashcardParams {
  mode?: 'TODAY' | 'PICK'
  subject?: 'ENGLISH' | 'MATH'
  cardIds?: number[]
  limit?: number
}

/** 플래시카드 큐 — GET /api/study/flashcards (F-05·28) */
export function fetchFlashcards(params: FlashcardParams = {}): Promise<FlashcardQueue> {
  const q = new URLSearchParams()
  if (params.mode) q.set('mode', params.mode)
  if (params.subject) q.set('subject', params.subject)
  if (params.cardIds?.length) q.set('cardIds', params.cardIds.join(','))
  if (params.limit != null) q.set('limit', String(params.limit))
  const qs = q.toString()
  return apiGet<FlashcardQueue>(`/api/study/flashcards${qs ? `?${qs}` : ''}`)
}

export interface StudyRecordBody {
  activity: StudyActivity
  result: StudyResult
  reasonTag?: ReasonTag
  durationMs?: number
  detail?: Record<string, unknown> // F-26 MATH_REVIEW 전용
}

export interface StudyRecordResult {
  cardId: number
  boxLevel: number
  nextReviewAt: string
  graduated: boolean
}

/** 학습 기록(단일 진입점) — POST /api/cards/{id}/study (F-05·09·19·26) */
export function recordStudy(cardId: number, body: StudyRecordBody): Promise<StudyRecordResult> {
  return apiPost<StudyRecordResult>(`/api/cards/${cardId}/study`, body)
}

/** 오늘의 학습 추천 통계 (F-28) — memoryRate 는 평균 회상확률 R(0~1, null 가능) */
export interface Recommendation {
  reviewCount: number
  memoryRate: number | null
  estimatedMinutes: number
}

/** 학습 추천 — GET /api/study/recommendation */
export function fetchRecommendation(): Promise<Recommendation> {
  return apiGet<Recommendation>('/api/study/recommendation')
}
