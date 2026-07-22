import type { ClozeOption } from '../model/types'

interface Props {
  options: ClozeOption[]
  answer: string
  selected: string | null
  graded: boolean
  onSelect: (word: string) => void
}

// 4지선다 2×2 (35:235…) — 채점 전: 단어만 / 채점 후: 정답 초록·오답 빨강·나머지 회색 + 뜻 공개
export function OptionGrid({ options, answer, selected, graded, onSelect }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {options.map((opt) => (
        <OptionCard
          key={opt.word}
          option={opt}
          isAnswer={opt.word === answer}
          isChosen={opt.word === selected}
          graded={graded}
          onSelect={() => onSelect(opt.word)}
        />
      ))}
    </div>
  )
}

function OptionCard({
  option,
  isAnswer,
  isChosen,
  graded,
  onSelect,
}: {
  option: ClozeOption
  isAnswer: boolean
  isChosen: boolean
  graded: boolean
  onSelect: () => void
}) {
  const base = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    cursor: graded ? 'default' : 'pointer',
    textAlign: 'center' as const,
  }

  if (!graded) {
    return (
      <button
        type="button"
        onClick={onSelect}
        style={{
          ...base,
          minHeight: 50,
          background: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border-default)',
          fontSize: 15,
          fontWeight: 500,
          color: 'var(--color-text-primary)',
        }}
      >
        {option.word}
      </button>
    )
  }

  const chosenWrong = isChosen && !isAnswer
  const tone = isAnswer
    ? { bg: 'var(--color-success-weak)', border: '1.5px solid var(--color-success-primary)', fg: '#0a8a55' }
    : chosenWrong
      ? { bg: 'var(--color-danger-weak)', border: '1px solid var(--color-danger-primary)', fg: '#c22c3a' }
      : { bg: 'var(--grey-50)', border: '1px solid var(--color-border-default)', fg: '#7b7f85' }

  return (
    <div style={{ ...base, minHeight: 82, background: tone.bg, border: tone.border, padding: '8px' }}>
      <span style={{ fontSize: 15, fontWeight: 500, color: tone.fg }}>
        {isAnswer ? '✓ ' : chosenWrong ? '✕ ' : ''}
        {option.word}
      </span>
      {!isAnswer && (
        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{option.meaning}</span>
      )}
    </div>
  )
}
