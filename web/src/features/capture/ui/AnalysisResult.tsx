import type { ReactNode } from 'react'
import { NavigationBar, Button, IconSpeaker } from '@/shared/ui'

interface Props {
  onBack: () => void
  onGoNote: () => void
}

const CONCEPT_GRADIENT = 'linear-gradient(90deg, var(--color-brand-weak), var(--teal-50))'

// 분석 완료 (130:905) — 생성된 카드 프리뷰 + 오답노트로 이동
export function AnalysisResult({ onBack, onGoNote }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--color-bg-secondary)',
      }}
    >
      <NavigationBar title="오답 문제" onBack={onBack} />

      <div style={{ flex: 1, padding: '20px var(--spacing-xl)' }}>
        <article
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 20,
            boxShadow: 'var(--shadow-modal)',
            padding: 15,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <div
            style={{
              position: 'relative',
              height: 200,
              borderRadius: 12,
              background: CONCEPT_GRADIENT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                fontSize: 10,
                fontWeight: 500,
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255,255,255,0.85)',
                color: 'var(--color-text-secondary)',
              }}
            >
              ✨ AI 연상 이미지
            </span>
            <span aria-hidden>⚖️</span>
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 30, fontWeight: 700, color: 'var(--color-text-primary)' }}>sound</span>
            <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>[saʊnd]</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={pill(true)}>🇺🇸 미국</span>
              <span style={pill(false)}>🇬🇧 영국</span>
              <span style={{ color: 'var(--color-text-brand)', display: 'inline-flex' }}>
                <IconSpeaker size={20} />
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Tag tone="grey">형용사</Tag>
              <Tag tone="blue">📚 학업</Tag>
              <Tag tone="blue">다의어</Tag>
            </div>
          </div>

          <span style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-tertiary)' }}>
            카드를 탭하면 뜻이 보여요
          </span>
        </article>
      </div>

      <div style={{ padding: '0 var(--spacing-xl) 24px' }}>
        <Button block size="lg" onClick={onGoNote}>
          오답 노트로 가기
        </Button>
      </div>
    </div>
  )
}

function pill(active: boolean) {
  return {
    fontSize: 12,
    fontWeight: 500,
    padding: '5px 10px',
    borderRadius: 'var(--radius-full)',
    background: active ? 'var(--color-brand-weak)' : 'var(--color-bg-primary)',
    color: active ? 'var(--color-text-brand)' : 'var(--color-text-secondary)',
    border: active ? '1px solid transparent' : '1px solid var(--color-border-default)',
  } as const
}

function Tag({ tone, children }: { tone: 'grey' | 'blue'; children: ReactNode }) {
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
      }}
    >
      {children}
    </span>
  )
}
