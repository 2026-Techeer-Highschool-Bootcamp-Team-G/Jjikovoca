import { apiPost, apiDownload } from '@/shared/api'

// 내보내기 유형 (명세 §내보내기) — 오답노트 PDF / 단어 시험지 / 공유 카드
export type ExportKind = 'PDF_NOTE' | 'PDF_WORDTEST' | 'JPG_CARD'

interface ExportInput {
  type: ExportKind
  cardIds?: number[] // 미지정 시 전체
}

export interface ExportResult {
  downloadUrl: string
  expiresIn: number
}

/** 오답노트 내보내기 생성(프리미엄) — POST /api/export/note (AI 편집 1회 + 서버 렌더) */
export function createExport(input: ExportInput): Promise<ExportResult> {
  return apiPost<ExportResult>('/api/export/note', input)
}

/**
 * 생성된 파일 실제 다운로드 — GET {downloadUrl}(인증 필수)을 blob 으로 받아 저장한다.
 * 다운로드 URL 은 인증 게이트 엔드포인트라 앵커로 열면 실패하므로 apiDownload 로 헤더를 실어 받는다.
 */
export async function downloadExport(downloadUrl: string): Promise<void> {
  const { blob, filename } = await apiDownload(downloadUrl)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename ?? 'jjikoboka-export.pdf' // .pdf 파일명 명시(서버가 안 주면 폴백)
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
