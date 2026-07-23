import { apiGet, apiPost } from '@/shared/api'
import type { ClozeItem, ClozeJudge } from '../model/types'

/** 빈칸 퀴즈 문항 생성 — GET /api/study/cloze (저장 예문 재활용, 정답 미포함) */
export function fetchClozeQueue(limit = 10): Promise<ClozeItem[]> {
  return apiGet<{ items: ClozeItem[] }>(`/api/study/cloze?limit=${limit}`).then((r) => r.items)
}

/** 빈칸 답 제출 — POST /api/study/cloze/{id}/answer (서버 판정+이력+전이 일체) */
export function submitClozeAnswer(cardId: number, guess: string, durationMs?: number): Promise<ClozeJudge> {
  return apiPost<ClozeJudge>(`/api/study/cloze/${cardId}/answer`, { guess, durationMs })
}

/** AI 예문 재생성(프리미엄) — POST /api/study/cloze/{id}/regenerate */
export function regenerateCloze(cardId: number): Promise<{ cardId: number; clozeText: string; hints: string[] }> {
  return apiPost(`/api/study/cloze/${cardId}/regenerate`)
}
