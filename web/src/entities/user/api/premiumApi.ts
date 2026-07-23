import { apiPost } from '@/shared/api'

/** 프리미엄 활성화(모의 결제, 플랜 B) — POST /api/premium/activate */
export function activatePremium(): Promise<{ premium: boolean }> {
  return apiPost<{ premium: boolean }>('/api/premium/activate')
}
