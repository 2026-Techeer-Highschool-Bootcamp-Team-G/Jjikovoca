import { apiGet, apiPost } from '@/shared/api'
import type { ClozeItem, ClozeJudge } from '../model/types'

/** 빈칸 퀴즈 문항 생성 — GET /api/study/cloze (저장 예문 재활용, 정답 미포함). cardIds 지정 시 PICK(선택 카드) — 백엔드 미지원 시 무시됨 */
export function fetchClozeQueue(opts: { limit?: number; cardIds?: number[] } = {}): Promise<ClozeItem[]> {
  const q = new URLSearchParams()
  q.set('limit', String(opts.limit ?? 10))
  if (opts.cardIds && opts.cardIds.length > 0) q.set('cardIds', opts.cardIds.join(','))
  return apiGet<{ items: ClozeItem[] }>(`/api/study/cloze?${q.toString()}`).then((r) => r.items)
}

/** 빈칸 답 제출 — POST /api/study/cloze/{id}/answer (서버 판정+이력+전이 일체) */
export function submitClozeAnswer(cardId: number, guess: string, durationMs?: number): Promise<ClozeJudge> {
  return apiPost<ClozeJudge>(`/api/study/cloze/${cardId}/answer`, { guess, durationMs })
}

/** AI 예문 재생성(프리미엄) — POST /api/study/cloze/{id}/regenerate */
export function regenerateCloze(cardId: number): Promise<{ cardId: number; clozeText: string; hints: string[] }> {
  return apiPost(`/api/study/cloze/${cardId}/regenerate`)
}
