import { apiGet, apiPost } from '@/shared/api'

/** 알림 유형 — REVIEW_DUE(복습대기 파생, id=null)·STREAK·LEVEL_UP(저장형) */
export type NotificationType = 'REVIEW_DUE' | 'STREAK' | 'LEVEL_UP'

export interface AppNotification {
  id: number | null
  type: NotificationType
  message: string
  read: boolean
  createdAt: string // ISO
}

/** 알림 목록 — GET /api/notifications (최신순 + 복습대기 상단) */
export function fetchNotifications(): Promise<AppNotification[]> {
  return apiGet<AppNotification[]>('/api/notifications')
}

/** 안 읽은 저장형 알림 전체 읽음 — POST /api/notifications/read */
export function markNotificationsRead(): Promise<null> {
  return apiPost<null>('/api/notifications/read')
}
