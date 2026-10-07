/** 카드 유형 썸네일 한 줄 — 형광펜(단어) / 박스(문제)를 이모지로 구분한다. */
export interface CardThumbProps {
  card: {
    type: 'WORD' | 'PROBLEM'
    word?: string
    summary?: string
    subject?: string
  }
}
export declare function CardThumb(props: CardThumbProps): JSX.Element
