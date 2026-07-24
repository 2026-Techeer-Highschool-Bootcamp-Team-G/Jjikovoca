/*
 * 공통 fetch 클라이언트 — 문서 04 §0 규약.
 * - Authorization: Bearer {accessToken} 자동 첨부
 * - 공통 응답 봉투 { success, data, message } 에서 data 를 언랩해 반환
 * - 실패(!res.ok 또는 success:false)는 message 로 ApiError 정규화
 * - 401 → refresh 토큰으로 재발급 후 원요청 1회 재시도, 실패 시 토큰 폐기
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const ACCESS_KEY = 'jjik.access'
const REFRESH_KEY = 'jjik.refresh'

/** 공통 응답 봉투 (API 명세 §0) */
export interface ApiEnvelope<T> {
  success: boolean
  data: T
  message: string
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_KEY, accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

// 동시 401 시 refresh 요청을 하나로 합침(중복 회전 방지)
let refreshInFlight: Promise<boolean> | null = null

/** refresh 토큰으로 access+refresh 재발급(회전). 성공 여부 반환. */
function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return Promise.resolve(false)
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        // 인터셉터 재귀를 피하려 apiFetch 대신 직접 호출
        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
        const body = (await res.json().catch(() => null)) as ApiEnvelope<{
          accessToken: string
          refreshToken: string
        }> | null
        if (!res.ok || !body || body.success === false || !body.data) return false
        setTokens(body.data.accessToken, body.data.refreshToken)
        return true
      } catch {
        return false
      } finally {
        refreshInFlight = null
      }
    })()
  }
  return refreshInFlight
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })

  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null

  // 인증 실패 → refresh 로 재발급 후 원요청 1회 재시도.
  // 백엔드는 만료/무효 토큰에 401 이 아니라 403+빈 본문(Spring 필터 거부)을 주므로 이 403 도 포함한다.
  // 단, 업무 거부(PREMIUM_REQUIRED 등)는 { success:false } 봉투 403 이므로 refresh 하지 않는다(오작동 로그아웃 방지).
  const authFailed = res.status === 401 || (res.status === 403 && body?.success !== false)
  if (authFailed) {
    if (!retried && (await refreshTokens())) {
      return apiFetch<T>(path, init, true)
    }
    clearTokens()
    throw new ApiError(res.status, '로그인이 필요합니다.')
  }

  // 실패: HTTP 오류 또는 봉투 success:false → message 로 정규화
  if (!res.ok || (body != null && body.success === false)) {
    const message = body?.message ?? `요청이 실패했습니다 (${res.status})`
    throw new ApiError(res.status, message)
  }

  // 공통 봉투에서 data 언랩 (logout 등 data:null 은 null 반환)
  return (body ? body.data : (undefined as T))
}

export function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path)
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}
