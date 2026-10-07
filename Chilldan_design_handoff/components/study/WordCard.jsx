import React from 'react'
import { Icon } from '../core/Icon'
import { Badge } from '../core/Badge'
import { TagList } from '../core/TagList'

// 홈 최근 카드 (185:1093) — 개념 이미지 + 단어 + 발음 + 미/영 발음 + 태그 + 탭 힌트 (+ 정답/오답 accent)
export function WordCard({ card, result, pronunciation, conceptEmoji, tags, onSpeak, onClick }) {
  const accent = result === 'WRONG' ? 'var(--color-result-wrong)' : result === 'CORRECT' ? 'var(--color-result-correct)' : null
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
        boxShadow: 'var(--shadow-modal)',
        fontFamily: 'var(--font-sans)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: 118, borderRadius: 12, background: 'var(--gradient-concept)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(255,255,255,0.85)', color: 'var(--color-text-secondary)', fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 999 }}>
          ✨ AI 연상 이미지
        </span>
        {result && (
          <span style={{ position: 'absolute', top: 8, right: 8 }}>
            <Badge color={result === 'WRONG' ? 'red' : 'green'}>{result === 'WRONG' ? '오답' : '정답'}</Badge>
          </span>
        )}
        <span style={{ fontSize: 48, lineHeight: 1 }} aria-hidden>{conceptEmoji || '⚖️'}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginTop: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)' }}>{(card && card.word) || '단어'}</span>
        {pronunciation && <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>{pronunciation}</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <VoiceButton primary label="🇺🇸 미국" onClick={() => onSpeak && onSpeak('US')} />
        <VoiceButton label="🇬🇧 영국" onClick={() => onSpeak && onSpeak('UK')} />
        <button
          type="button"
          aria-label="발음 듣기"
          onClick={(e) => {
            e.stopPropagation()
            if (onSpeak) onSpeak()
          }}
          style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-text-brand)', cursor: 'pointer', display: 'inline-flex' }}
        >
          <Icon name="speaker" size={20} />
        </button>
      </div>

      {tags && tags.length > 0 && <TagList tags={tags} max={2} align="center" />}

      <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>카드를 탭하면 뜻이 보여요</span>
    </article>
  )
}

function VoiceButton({ label, primary = false, onClick }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        if (onClick) onClick()
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
