/**
 * 단어장·검색 결과의 카드 행. 발음 재생 중에는 행 전체가 브랜드 글로우로 강조된다.
 */
export interface CardRowView {
  id: number
  /** 단어 또는 문제 요약 */
  title: string
  pronunciation?: string
  /** 문맥 뜻 또는 문제 요약 */
  subtitle: string
  /** 사용자 정의 태그 — 무제한. 목록에서는 tagMax 개까지 보이고 나머지는 '+N' 으로 접힌다 (FR-04) */
  tags?: { label: string; kind?: 'tag' | 'exam'; dday?: number }[]
  /** 일반 태그 노출 개수 (기본 2) */
  tagMax?: number
  typeBadge?: { label: string; color: 'red' | 'blue' }
  /** 태깅된 시험 — 문자열 또는 D-day 포함 객체. 항상 일반 태그보다 앞에 강조 배치된다 */
  exams?: (string | { label: string; dday?: number })[]
  /** 시험 미지정 — "+ 시험" 칩을 띄운다 */
  untagged?: boolean
  /** 알/헷/몰 누적 횟수 — 넘기면 태그 줄 오른쪽에 표시된다 (FR-18) */
  ratings?: { know: number; confused: number; dontKnow: number }
  showSpeaker?: boolean
  example?: string
  exampleTranslation?: string
}
export interface CardRowProps {
  row: CardRowView
  onClick?: () => void
  onSpeak?: () => void
  onExamTag?: () => void
  /** '+N' 태그 칩을 눌렀을 때 (태그 전체 보기 시트) */
  onMoreTags?: () => void
  /** 다중 선택 모드 — 우상단 체크 표식 */
  selectable?: boolean
  selected?: boolean
  /** 발음 재생 중 강조 */
  speaking?: boolean
  /** 클릭 시 예문·해석 펼침(example 이 있을 때만) */
  expandable?: boolean
}
export declare function CardRow(props: CardRowProps): JSX.Element
