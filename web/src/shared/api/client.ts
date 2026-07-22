/*
 * 공통 fetch 클라이언트 — 문서 04 §0 규약.
 * - Authorization: Bearer {token} 자동 첨부 (30일 HMAC 토큰)
 * - 에러 형식 { error: "한국어 메시지" } 를 ApiError 로 정규화
 * - 401 → 토큰 폐기 후 "로그인이 필요합니다."
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const TOKEN_KEY = 'jjik.token'

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

interface ErrorBody {
  error?: string
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

  const data = (await res.json().catch(() => null)) as (T & ErrorBody) | null

  if (!res.ok) {
    const message = data?.error ?? `요청이 실패했습니다 (${res.status})`
    throw new ApiError(res.status, message)
  }

  return data as T
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
