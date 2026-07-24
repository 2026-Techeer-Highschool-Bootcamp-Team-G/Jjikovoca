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

/**
 * 백엔드 Card → 홈/오답노트 앞면 카드.
 * ⚠️ 정답·단계 content 는 비노출 계약(학습 판정 응답에만) → 앞면엔 백엔드 제공 필드만 매핑한다.
 * 발음·emoji·품사는 백엔드 미제공(FE 데모) → concept 을 유형 태그로 대체.
 */
export function cardToRecent(c: Card): RecentCard {
  const tags = c.concept ? [{ label: c.concept, tone: 'grey' as const }] : []
  const exams = (c.exams ?? []).map((e) => e.title)
  if (c.type === 'WORD') {
    return {
      id: c.id,
      type: 'WORD',
      tags,
      exams,
      word: c.word,
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
