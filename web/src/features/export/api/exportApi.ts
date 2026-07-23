import { apiPost } from '@/shared/api'

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
