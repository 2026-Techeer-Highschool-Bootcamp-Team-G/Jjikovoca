/** 내 정보 + 한도 현황 (F-11) — premium 은 구독 상태 계산값 */
export interface Me {
  email: string
  nickname: string
  premium: boolean
  dailyUsed: number
  dailyLimit: number
  aiMockMode: boolean
}
