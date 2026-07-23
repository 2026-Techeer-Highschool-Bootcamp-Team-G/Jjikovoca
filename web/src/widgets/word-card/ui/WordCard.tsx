import type { Card } from '@/entities/card'
import { Badge, IconSpeaker } from '@/shared/ui'

interface Props {
  card: Card
  result?: 'CORRECT' | 'WRONG' // 홈 QA #3 — 최근 카드 정답/오답 색
  pronunciation?: string
  conceptEmoji?: string
  tags?: { label: string; tone: 'grey' | 'blue' }[]
  onSpeak?: (locale?: 'US' | 'UK') => void
  onClick?: () => void
}

// 홈 최근 카드 (185:1093, Figma 03 홈) — 개념 이미지 + 단어 + 발음 + 미/영 발음 + 태그 + 탭 힌트
// (+ QA #3 정답/오답 accent: 좌측 색 + 배지)
export function WordCard({ card, result, pronunciation, conceptEmoji, tags, onSpeak, onClick }: Props) {
  const accent = result === 'WRONG' ? '#e5484d' : result === 'CORRECT' ? '#0a8a55' : null
  return (
    <article
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-default)',
        ...(accent ? { borderLeftWidth: 4, borderLeftColor: accent } : {}),
        borderRadius: 20,
        boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* 개념 이미지 (AI 연상 이미지) */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 118,
          borderRadius: 12,
          background: 'linear-gradient(90deg, #e8f3ff 0%, #e7f8f8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            background: 'rgba(255,255,255,0.85)',
            color: 'var(--color-text-secondary)',
            fontSize: 10,
            fontWeight: 500,
            padding: '3px 8px',
            borderRadius: 999,
          }}
        >
          ✨ AI 연상 이미지
        </span>
        {result && (
          <span style={{ position: 'absolute', top: 8, right: 8 }}>
            <Badge color={result === 'WRONG' ? 'red' : 'green'}>
              {result === 'WRONG' ? '오답' : '정답'}
            </Badge>
          </span>
        )}
        <span style={{ fontSize: 48, lineHeight: 1 }} aria-hidden>
          {conceptEmoji ?? '⚖️'}
        </span>
      </div>

      {/* 단어 + 발음 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginTop: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {card.word ?? '단어'}
        </span>
        {pronunciation && (
          <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>{pronunciation}</span>
        )}
      </div>

      {/* 발음 버튼 (미국/영국) + 스피커 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <VoiceButton primary label="🇺🇸 미국" onClick={() => onSpeak?.('US')} />
        <VoiceButton label="🇬🇧 영국" onClick={() => onSpeak?.('UK')} />
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

      {/* 태그 */}
      {tags && tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {tags.map((t) => (
            <Tag key={t.label} label={t.label} tone={t.tone} />
          ))}
        </div>
      )}

      {/* 탭 힌트 */}
      <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>카드를 탭하면 뜻이 보여요</span>
    </article>
  )
}

// 발음 버튼 — 미국(강조: brand-weak) / 영국(흰 배경 + 테두리)
function VoiceButton({ label, primary = false, onClick }: { label: string; primary?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
        background: primary ? 'var(--color-brand-weak)' : 'var(--color-bg-primary)',
        color: primary ? 'var(--color-text-brand)' : 'var(--color-text-secondary)',
        border: primary ? '1px solid transparent' : '1px solid var(--color-border-default)',
      }}
    >
      {label}
    </button>
  )
}

// 태그 — grey(품사) / blue(주제·유형)
function Tag({ label, tone }: { label: string; tone: 'grey' | 'blue' }) {
  const blue = tone === 'blue'
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 500,
        padding: '2px 7px',
        borderRadius: 5,
        background: blue ? 'var(--color-brand-weak)' : 'var(--color-bg-secondary)',
        color: blue ? 'var(--color-text-brand)' : 'var(--color-text-secondary)',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}
