// 홈 최근 카드 / 저장 카드 공용 모델 — 영어(단어) + 수학(문제, 사고 단계+정답)
export interface RecentCard {
  id: number
  type: 'WORD' | 'PROBLEM'
  // WORD
  word?: string
  pronunciation?: string
  emoji?: string
  pos?: string
  meaning?: string
  example?: string
  // PROBLEM
  problem?: string
  answer?: string
  steps?: string[] // 사고 단계 1~n
  solution?: string
}

// 저장 카드 스토어 — 백엔드 연결 전 localStorage 데모(오답노트 기본 저장 + 홈 캐러셀 연동)
const KEY = 'jjik.savedCards'
const EVT = 'jjik:saved-cards'

function read(): RecentCard[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as RecentCard[]) : []
  } catch {
    return []
  }
}

let cache: RecentCard[] = read()

/** 저장된 카드(최신 먼저) — useSyncExternalStore 스냅샷 */
export function getSavedCards(): RecentCard[] {
  return cache
}

/** 카드 저장 — 최신이 앞에 오도록 prepend, 홈/오답노트에 즉시 반영 */
export function saveCards(cards: RecentCard[]): void {
  cache = [...cards, ...cache]
  try {
    localStorage.setItem(KEY, JSON.stringify(cache))
  } catch {
    // 저장 실패는 무시(용량 초과 등)
  }
  window.dispatchEvent(new Event(EVT))
}

export function subscribeSavedCards(cb: () => void): () => void {
  window.addEventListener(EVT, cb)
  return () => window.removeEventListener(EVT, cb)
}
