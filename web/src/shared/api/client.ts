/*
 * 공통 fetch 클라이언트 — 문서 04 §0 규약.
 * - Authorization: Bearer {token} 자동 첨부
 * - 공통 응답 봉투 { success, data, message } 에서 data 를 언랩해 반환
 * - 실패(!res.ok 또는 success:false)는 message 로 ApiError 정규화
 * - 401 → 토큰 폐기 후 "로그인이 필요합니다." (refresh 회전은 Phase 0-2)
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const TOKEN_KEY = 'jjik.token'

/** 공통 응답 봉투 (API 명세 §0) */
export interface ApiEnvelope<T> {
  success: boolean
  data: T
  message: string
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })

  if (res.status === 401) {
    clearToken()
    throw new ApiError(401, '로그인이 필요합니다.')
  }

  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null

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
