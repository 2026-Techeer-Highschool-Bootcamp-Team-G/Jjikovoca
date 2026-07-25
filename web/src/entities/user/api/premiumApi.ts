import { apiPost, apiFetch } from '@/shared/api'

/** 프리미엄 활성화(모의 결제, 플랜 B) — POST /api/premium/activate */
export function activatePremium(): Promise<{ premium: boolean }> {
  return apiPost<{ premium: boolean }>('/api/premium/activate')
}

/** 프리미엄 해지 — DELETE /api/premium. 해지해도 만료일까지 premium 유지(명세 §8) */
export function deactivatePremium(): Promise<{ premium: boolean }> {
  return apiFetch<{ premium: boolean }>('/api/premium', { method: 'DELETE' })
}
