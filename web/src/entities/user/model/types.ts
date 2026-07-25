/** 내 정보 + 한도 현황 (F-11) — premium 은 구독 상태 계산값 */
export interface Me {
  email: string
  nickname: string
  premium: boolean
  dailyUsed: number
  dailyLimit: number
  aiMockMode: boolean
  level?: number
  exp?: number
  // 프리미엄 구독 정보(무료는 null). 해지해도 만료일까지 premium 유지
  premiumPlan?: string | null
  premiumExpiresAt?: string | null // ISO
  premiumAmount?: number | null // 원
}
