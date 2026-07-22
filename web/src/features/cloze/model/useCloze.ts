import { useState } from 'react'
import type { ClozeQuestion } from './types'

export function useCloze(question: ClozeQuestion) {
  const [selected, setSelected] = useState<string | null>(null)
  const graded = selected !== null
  const correct = selected === question.answer

  // 보기를 고르면 바로 채점 (04 §5). 이미 채점됐으면 재선택 불가.
  const select = (word: string) => {
    if (!graded) setSelected(word)
  }

  return { selected, graded, correct, select }
}
