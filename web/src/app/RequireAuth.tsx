import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getAccessToken } from '@/shared/api'

/**
 * 인증 가드 — accessToken 이 없으면 로그인으로 보낸다.
 * 백엔드는 미인증 요청에 403 을 주므로(401 아님) client 의 refresh 가 안 걸린다.
 * 보호 라우트를 이 가드로 감싸 미인증 상태에서 목업 폴백으로 새지 않게 한다.
 * 로그인 후 원래 가려던 위치(from)로 복귀할 수 있도록 location 을 넘긴다.
 */
export function RequireAuth() {
  const location = useLocation()
  if (!getAccessToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}
