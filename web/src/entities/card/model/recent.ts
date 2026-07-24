import type { Card } from './types'

// 홈 최근 카드 / 오답노트 앞면 공용 모델 — 영어(단어) + 수학(문제)
export interface RecentCard {
  id: number
  type: 'WORD' | 'PROBLEM'
  // 공통 — 유형·특성 태그 + 시험 정보 태그(등록한 시험명). 홈/오답노트 앞면 공용
  tags?: { label: string; tone: 'grey' | 'blue' }[]
  exams?: string[]
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

// 백엔드 tags(문자열 배열) → 앞면 배지. 첫 태그 grey, 나머지 blue(기존 룩 유지).
// 없으면 concept 를 유형 태그로 폴백.
function toBadges(c: Card): { label: string; tone: 'grey' | 'blue' }[] {
  if (c.tags && c.tags.length > 0) {
    return c.tags.map((t, i) => ({ label: t, tone: i === 0 ? ('grey' as const) : ('blue' as const) }))
  }
  return c.concept ? [{ label: c.concept, tone: 'grey' as const }] : []
}

/**
 * 백엔드 Card → 홈/오답노트 앞면 카드.
 * ⚠️ 정답·단계 content 는 비노출 계약(학습 판정 응답에만) → 앞면엔 백엔드 제공 필드만 매핑한다.
 * 발음·emoji·품사·유형태그는 백엔드 제공(기존 카드는 null). 발음 오디오는 클라 Web Speech.
 */
export function cardToRecent(c: Card): RecentCard {
  const tags = toBadges(c)
  const exams = (c.exams ?? []).map((e) => e.title)
  if (c.type === 'WORD') {
    return {
      id: c.id,
      type: 'WORD',
      tags,
      exams,
      word: c.word,
      pronunciation: c.pronunciation ?? undefined,
      pos: c.pos ?? undefined,
      emoji: c.emoji ?? undefined,
      meaning: c.contextMeaning ?? c.dictMeaning,
      example: c.example,
    }
  }
  return {
    id: c.id,
    type: 'PROBLEM',
    tags,
    exams,
    problem: c.latex ?? c.summary ?? '문제',
    solution: c.summary,
  }
}
