import type { Card } from '@/entities/card'
import { Badge, IconSpeaker } from '@/shared/ui'

interface Props {
  card: Card
  result?: 'CORRECT' | 'WRONG' // 홈 QA #3 — 최근 카드 정답/오답 색
  onSpeak?: () => void
  onClick?: () => void
}

// 찍어보카 단어 카드 (10:21) — 크롭(형광펜) + 단어 + Box 배지 + 문맥 뜻 + 예문 (+정답/오답 accent)
export function WordCard({ card, result, onSpeak, onClick }: Props) {
  const accent = result === 'WRONG' ? '#e5484d' : result === 'CORRECT' ? '#0a8a55' : null
  return (
    <article
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
        padding: 'var(--spacing-lg)',
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-default)',
        ...(accent ? { borderLeftWidth: 4, borderLeftColor: accent } : {}),
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <CropPreview imagePath={card.imagePath} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {card.word ?? '단어'}
        </span>
        <Badge color="blue">Box {card.boxLevel}</Badge>
        {result && (
          <Badge color={result === 'WRONG' ? 'red' : 'green'}>
            {result === 'WRONG' ? '오답' : '정답'}
          </Badge>
        )}
        <button
          type="button"
          aria-label="발음 듣기"
          onClick={(e) => {
            e.stopPropagation()
            onSpeak?.()
          }}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'var(--color-text-brand)',
            cursor: 'pointer',
            display: 'inline-flex',
          }}
        >
          <IconSpeaker size={20} />
        </button>
      </div>

      {card.contextMeaning && (
        <p
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--color-text-brand)',
          }}
        >
          {card.contextMeaning}
        </p>
      )}
      {card.example && (
        <p style={{ margin: 0, fontSize: 15, color: 'var(--color-text-secondary)' }}>
          {card.example}
        </p>
      )}
    </article>
  )
}

// 크롭 원문 미리보기. imagePath 있으면 실제 이미지, 없으면 형광펜 스켈레톤(프로토타입 표현).
function CropPreview({ imagePath }: { imagePath?: string | null }) {
  if (imagePath) {
    return (
      <img
        src={imagePath}
        alt="캡처 원문"
        style={{
          width: '100%',
          height: 110,
          objectFit: 'cover',
          borderRadius: 'var(--radius-sm)',
        }}
      />
    )
  }
  const bar = (w: string) => (
    <div style={{ height: 8, width: w, borderRadius: 4, background: 'var(--grey-300)' }} />
  )
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 10,
        height: 110,
        padding: '14px 16px',
        background: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-sm)',
      }}
      aria-hidden
    >
      {bar('100%')}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ height: 18, width: 96, borderRadius: 9, background: 'var(--color-highlight)' }} />
        {bar('100%')}
      </div>
      {bar('160px')}
    </div>
  )
}
