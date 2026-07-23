import { apiPost, setTokens, clearTokens, getRefreshToken } from '@/shared/api'

// 인증 API (F-01) — 명세 §인증/계정. 로그인/회원가입 성공 시 access+refresh 저장
export interface AuthUser {
  email: string
  nickname: string
  premium: boolean
}

interface AuthResult {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

/** 로그인 → JWT access+refresh 저장 후 사용자 반환 */
export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await apiPost<AuthResult>('/api/auth/login', { email, password })
  setTokens(data.accessToken, data.refreshToken)
  return data.user
}

/** 회원가입 → JWT access+refresh 저장 후 사용자 반환 */
export async function register(email: string, password: string, nickname?: string): Promise<AuthUser> {
  const data = await apiPost<AuthResult>('/api/auth/register', { email, password, nickname })
  setTokens(data.accessToken, data.refreshToken)
  return data.user
}

/** 로그아웃 → refresh 토큰 폐기(항상 로컬 토큰 제거) */
export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken()
  try {
    if (refreshToken) await apiPost('/api/auth/logout', { refreshToken })
  } finally {
    clearTokens()
  }
}
