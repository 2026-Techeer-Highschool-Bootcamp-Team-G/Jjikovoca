import { createWorker, type Worker } from 'tesseract.js'

// eng 워커 lazy 싱글톤 — 첫 OCR 때만 로드(Tesseract 코어·언어 데이터 지연 로드로 초기 번들 부담 회피)
let workerPromise: Promise<Worker> | null = null
function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = createWorker('eng').catch((e) => {
      workerPromise = null // 실패 시 다음 시도에서 재로드
      throw e
    })
  }
  return workerPromise
}

/**
 * 크롭 이미지들을 OCR 해 단어 힌트 배열을 만든다(cropImages 와 인덱스 정렬).
 * - 소문자·공백정리한 raw 텍스트만 반환(세부 정규화는 백엔드 담당)
 * - confidence < minConfidence 또는 빈 결과는 "" → 백엔드가 그 단어는 캐시 우회(잘못된 히트 방지)
 * - OCR 은 순수 힌트라 워커/인식 실패는 "" 로 폴백해 분석 흐름을 절대 막지 않는다
 */
export async function ocrWords(crops: string[], minConfidence = 70): Promise<string[]> {
  if (crops.length === 0) return []
  let worker: Worker
  try {
    worker = await getWorker()
  } catch {
    return crops.map(() => '') // 워커 로드 실패 → 전부 힌트 없음(하위호환 경로)
  }
  const words: string[] = []
  for (const crop of crops) {
    try {
      const { data } = await worker.recognize(crop)
      const text = (data.text ?? '').toLowerCase().replace(/\s+/g, ' ').trim()
      words.push(data.confidence >= minConfidence && text ? text : '')
    } catch {
      words.push('')
    }
  }
  return words
}
